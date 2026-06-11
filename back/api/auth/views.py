from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['GET'])
@permission_classes([IsAuthenticated]) # protege o endpoint
def auth_me(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email
    })

# Endpoint para gerar tokens JWT após login social
@api_view(['GET']) 
@permission_classes([IsAuthenticated]) # protege também o social_jwt
def social_jwt(request):
    user = request.user
    if not user.is_authenticated:
        return Response({"error": "Usuário não autenticado"}, status=401)

    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    })