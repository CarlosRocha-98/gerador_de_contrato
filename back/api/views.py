from io import BytesIO
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
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


# ── Registro 
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]  # único endpoint público


# ── Perfil de Usuário 
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
    permission_classes = [permissions.IsAuthenticated]

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
                .signature-lines {{ margin-top: 50px; }}
                .signature-line  {{ margin-bottom: 30px; }}
                .signature-line hr {{ border: none; border-top: 1px solid #000;
                                      width: 60%; margin-bottom: 4px; }}
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
