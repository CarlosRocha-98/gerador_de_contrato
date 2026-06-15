from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Cliente, ContratoServico, Imovel, ContratoAluguel, PerfilUsuario


# Perfil de Usuário
class PerfilUsuarioSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='usuario.email', read_only=True)
    username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_id = serializers.IntegerField(source='usuario.id', read_only=True)
    
    class Meta:
        model = PerfilUsuario
        # Expose all PerfilUsuario fields plus linked user info
        fields = [
            'usuario_id', 'username', 'email',
            'nome', 'nacionalidade', 'profissao', 'estado_civil',
            'orgao_expedidor', 'cpf', 'telefone',
            'rua', 'numero', 'bairro', 'cep', 'cidade', 'estado',
            'criado_em'
        ]
        read_only_fields = ['usuario', 'criado_em']


# Registro de usuário 
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    # Campos do perfil (write_only para não tentar ler do User na resposta)
    nome = serializers.CharField(required=False, allow_blank=True, write_only=True)
    cpf = serializers.CharField(required=False, allow_blank=True, write_only=True)
    telefone = serializers.CharField(required=False, allow_blank=True, write_only=True)
    nacionalidade = serializers.CharField(required=False, allow_blank=True, write_only=True)
    profissao = serializers.CharField(required=False, allow_blank=True, write_only=True)
    estado_civil = serializers.CharField(required=False, allow_blank=True, write_only=True)
    orgao_expedidor = serializers.CharField(required=False, allow_blank=True, write_only=True)
    
    # Endereço
    rua = serializers.CharField(required=False, allow_blank=True, write_only=True)
    numero = serializers.CharField(required=False, allow_blank=True, write_only=True)
    bairro = serializers.CharField(required=False, allow_blank=True, write_only=True)
    cep = serializers.CharField(required=False, allow_blank=True, write_only=True)
    cidade = serializers.CharField(required=False, allow_blank=True, write_only=True)
    estado = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password',
            'nome', 'cpf', 'telefone', 'nacionalidade', 'profissao', 'estado_civil',
            'orgao_expedidor', 'rua', 'numero', 'bairro', 'cep', 'cidade', 'estado'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        # Extrair dados do perfil
        nome = validated_data.pop('nome', '')
        cpf = validated_data.pop('cpf', '')
        telefone = validated_data.pop('telefone', '')
        nacionalidade = validated_data.pop('nacionalidade', '')
        profissao = validated_data.pop('profissao', '')
        estado_civil = validated_data.pop('estado_civil', '')
        orgao_expedidor = validated_data.pop('orgao_expedidor', '')
        rua = validated_data.pop('rua', '')
        numero = validated_data.pop('numero', '')
        bairro = validated_data.pop('bairro', '')
        cep = validated_data.pop('cep', '')
        cidade = validated_data.pop('cidade', '')
        estado = validated_data.pop('estado', '')
        
        # Criar usuário
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        
        # Criar perfil automaticamente
        PerfilUsuario.objects.create(
            usuario=user,
            nome=nome or validated_data.get('username', ''),
            cpf=cpf,
            telefone=telefone,
            nacionalidade=nacionalidade,
            profissao=profissao,
            estado_civil=estado_civil,
            orgao_expedidor=orgao_expedidor,
            rua=rua,
            numero=numero,
            bairro=bairro,
            cep=cep,
            cidade=cidade,
            estado=estado
        )
        
        return user
    
# cliente
class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'
        read_only_fields = ['usuario', 'criado_em']

# imovel
class ImovelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imovel
        fields = '__all__'
        read_only_fields = ['usuario', 'criado_em']

# contrato aluguel
class ContratoAluguelSerializer(serializers.ModelSerializer):
    # Somente leitura: mostra os dados completos ao listar
    proprietario_detail = PerfilUsuarioSerializer(source='usuario.perfil', read_only=True)
    inquilino_detail    = ClienteSerializer(source='inquilino', read_only=True)
    imovel_detail       = ImovelSerializer(source='imovel', read_only=True)

    class Meta:
        model = ContratoAluguel
        fields = '__all__'
        read_only_fields = ['usuario', 'criado_em']

class ContratoServicoSerializer(serializers.ModelSerializer):
    # Somente leitura: mostra os dados completos ao listar
    prestador_detail = PerfilUsuarioSerializer(source='usuario.perfil', read_only=True)
    contratante_detail = ClienteSerializer(source='contratante', read_only=True)
    
    class Meta:
        model = ContratoServico
        fields = '__all__'
        read_only_fields = ['usuario', 'criado_em']
