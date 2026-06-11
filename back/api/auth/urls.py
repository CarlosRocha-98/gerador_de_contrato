from django.urls import path
from .views import auth_me, social_jwt

urlpatterns = [
    path('me/', auth_me, name='auth_me'),
    path('jwt/', social_jwt, name='social_jwt'),
]
