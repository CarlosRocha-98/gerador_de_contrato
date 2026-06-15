from io import BytesIO
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.db import DatabaseError
from django.http import HttpResponse
from xhtml2pdf import pisa
from .models import Cliente, Imovel, ContratoAluguel, ContratoServico, PerfilUsuario
from .serializers import (
    RegisterSerializer,
    ClienteSerializer,
    ImovelSerializer,
    ContratoAluguelSerializer,
    ContratoServicoSerializer,
    PerfilUsuarioSerializer,
)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Finaliza a sessão do usuário."""
    logout(request)
    return Response({"message": "Logout realizado com sucesso"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Retorna informações básicas do usuário autenticado."""
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email
    })


# ── Registro 
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # único endpoint público


# ── Perfil de Usuário 
@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password_view(request):
    email = (request.data.get("email") or "").strip()
    new_password = request.data.get("new_password") or ""

    if not email or not new_password:
        return Response(
            {"detail": "Email e nova senha sao obrigatorios."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(new_password) < 6:
        return Response(
            {"detail": "A senha deve ter pelo menos 6 caracteres."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return Response(
            {"detail": "Usuario nao encontrado para este email."},
            status=status.HTTP_404_NOT_FOUND,
        )

    user.set_password(new_password)
    user.save(update_fields=["password"])

    return Response({"detail": "Senha redefinida com sucesso."})


class PerfilUsuarioView(generics.RetrieveUpdateAPIView):
    serializer_class = PerfilUsuarioSerializer

    def get_object(self):
        return self.request.user.perfil

    # Make GET response explicit to ensure serializer fields are returned as expected
    def retrieve(self, request, *args, **kwargs):
        perfil = self.get_object()
        serializer = self.get_serializer(perfil)
        return Response(serializer.data)


# ── Cliente 
class ClienteListCreateView(generics.ListCreateAPIView):
    serializer_class = ClienteSerializer

    def get_queryset(self):
        return Cliente.objects.filter(usuario=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            self.perform_create(serializer)
        except DatabaseError as exc:
            return Response(
                {
                    "detail": "Erro de banco ao salvar cliente.",
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as exc:
            return Response(
                {
                    "detail": "Erro inesperado ao salvar cliente.",
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class ClienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClienteSerializer

    def get_queryset(self):
        return Cliente.objects.filter(usuario=self.request.user)


# ── Imóvel 
class ImovelListCreateView(generics.ListCreateAPIView):
    serializer_class = ImovelSerializer

    def get_queryset(self):
        return Imovel.objects.filter(usuario=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            self.perform_create(serializer)
        except DatabaseError as exc:
            return Response(
                {
                    "detail": "Erro de banco ao salvar imóvel.",
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as exc:
            return Response(
                {
                    "detail": "Erro inesperado ao salvar imóvel.",
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class ImovelDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ImovelSerializer

    def get_queryset(self):
        return Imovel.objects.filter(usuario=self.request.user)


# ── Contrato Aluguel
class ContratoListCreateView(generics.ListCreateAPIView):
    serializer_class = ContratoAluguelSerializer

    def get_queryset(self):
        return ContratoAluguel.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class ContratoDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContratoAluguelSerializer

    def get_queryset(self):
        return ContratoAluguel.objects.filter(usuario=self.request.user)
    

# ── Contrato Serviço 
class ContratoServicoListCreateView(generics.ListCreateAPIView):
    serializer_class = ContratoServicoSerializer

    def get_queryset(self):
        return ContratoServico.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class ContratoServicoDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContratoServicoSerializer

    def get_queryset(self):
        return ContratoServico.objects.filter(usuario=self.request.user)


# ── Geração de PDF ─────────────────────────────────────────────────────────────
class GerarContratoPDFView(APIView):
    """Recebe HTML do contrato e devolve um arquivo PDF para download."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        html_content = request.data.get('html', '')
        titulo = request.data.get('titulo', 'contrato')

        if not html_content:
            return Response({'detail': 'Campo "html" é obrigatório.'}, status=400)

        # Envolve o HTML recebido com estilos básicos para impressão
        html_completo = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {{ margin: 2cm; }}
                body {{
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 12px;
                    color: #111;
                    line-height: 1.7;
                }}
                h2 {{ text-align: center; font-size: 15px; text-decoration: underline; margin-bottom: 18px; }}
                h3 {{ font-size: 13px; margin-top: 18px; margin-bottom: 8px; }}
                p  {{ font-size: 12px; text-align: justify; margin-bottom: 8px; }}
                .signature-lines {{ width: 100%; border-collapse: collapse; margin-top: 50px; }}
                .signature-line {{ width: 42%; border-top: 1px solid #000; text-align: center; vertical-align: top; padding-top: 6px; }}
                .signature-spacer {{ width: 16%; }}
            </style>
        </head>
        <body>{html_content}</body>
        </html>
        """

        buffer = BytesIO()
        result = pisa.CreatePDF(html_completo, dest=buffer, encoding='utf-8')

        if result.err:
            return Response({'detail': 'Erro ao gerar PDF.'}, status=500)

        buffer.seek(0)
        filename = f"{titulo.replace(' ', '_')}.pdf"
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
