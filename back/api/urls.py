from django.urls import path, include
from rest_framework_simplejwt.views import ( 
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import logout_view, profile_view
from .views import (
    RegisterView,
    PerfilUsuarioView,
    ClienteListCreateView,
    ClienteDetailView,
    ImovelListCreateView,
    ImovelDetailView,
    ContratoListCreateView,
    ContratoDetailView,
    ContratoServicoListCreateView,
    ContratoServicoDetailView,
    GerarContratoPDFView,
)

urlpatterns = [
    # Auth
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/', include('api.auth.urls')), # Nosso auth_me e social_jwt
    # path('auth/social/', include('social_django.urls', namespace='social')), # URLs do social auth

    path('register/', RegisterView.as_view(), name='register'),
    path('perfil/', PerfilUsuarioView.as_view(), name='perfil'),
    path('logout/', logout_view, name='logout'),
    path('profile/', profile_view, name='profile'),
    # Clientes
    path('clientes/', ClienteListCreateView.as_view(), name='cliente-list-create'),
    path('clientes/<int:pk>/', ClienteDetailView.as_view(), name='cliente-detail'),
    
    # Imóveis
    path('imoveis/', ImovelListCreateView.as_view(), name='imovel-list-create'),
    path('imoveis/<int:pk>/', ImovelDetailView.as_view(), name='imovel-detail'),
    
    # Contratos
    path('contratoaluguel/', ContratoListCreateView.as_view(), name='contrato-list-create'),
    path('contratoaluguel/<int:pk>/', ContratoDetailView.as_view(), name='contrato-detail'),
    path('contratoservico/', ContratoServicoListCreateView.as_view(), name='contrato-servico-list-create'),
    path('contratoservico/<int:pk>/', ContratoServicoDetailView.as_view(), name='contrato-servico-detail'),

    # Geração de PDF
    path('contratos/gerar-pdf/', GerarContratoPDFView.as_view(), name='gerar-pdf'),
]