from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Cliente, ContratoServico, Imovel, ContratoAluguel, PerfilUsuario, ESTADOS_CIVIS
from .cpf import cpf_valido, formatar_cpf, somente_digitos_cpf
from .telefone import formatar_telefone, telefone_valido


def normalizar_cpf(valor):
    return somente_digitos_cpf(valor)


class CPFSerializerMixin:
    def validate_cpf(self, value):
        # CPF-VALIDACAO: valida todos os CPFs recebidos pela API de clientes/perfil.
        if not cpf_valido(value):
            raise serializers.ValidationError('CPF inválido. Verifique os dígitos informados.')
        return formatar_cpf(value)

    def validate_telefone(self, value):
        if not telefone_valido(value):
            raise serializers.ValidationError(
                'Telefone inválido. Use celular (XX) XXXXX-XXXX ou fixo (XX) XXXX-XXXX.'
            )
        return formatar_telefone(value)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get('cpf'):
            data['cpf'] = formatar_cpf(data['cpf'])
        if data.get('telefone'):
            data['telefone'] = formatar_telefone(data['telefone'])
        return data


def primeiro_nome(nome):
    return str(nome or '').strip().split(' ', 1)[0].lower()


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        identificador = attrs.get(self.username_field, '')
        password = attrs.get('password', '')
        usuarios = User.objects.filter(email__iexact=identificador)

        if not usuarios.exists():
            usuarios = User.objects.filter(username=identificador)

        for usuario in usuarios:
            user = authenticate(
                request=self.context.get('request'),
                username=usuario.username,
                password=password,
            )

            if user is not None:
                attrs[self.username_field] = usuario.username
                return super().validate(attrs)

        return super().validate(attrs)


# Perfil de Usuário
class PerfilUsuarioSerializer(CPFSerializerMixin, serializers.ModelSerializer):
    email = serializers.EmailField(source='usuario.email', read_only=True)
    username = serializers.SerializerMethodField()
    usuario_id = serializers.IntegerField(source='usuario.id', read_only=True)

    def get_username(self, obj):
        return primeiro_nome(obj.nome)
    
    class Meta:
        model = PerfilUsuario
        # Expose all PerfilUsuario fields plus linked user info
        fields = [
            'usuario_id', 'username', 'email',
            'nome', 'nacionalidade', 'profissao', 'estado_civil',
            'cpf', 'telefone',
            'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado',
            'criado_em'
        ]
        read_only_fields = ['usuario', 'criado_em']


# Registro de usuário 
class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True, validators=[])
    password = serializers.CharField(write_only=True, min_length=6)
    
    # Campos do perfil (write_only para não tentar ler do User na resposta)
    nome = serializers.CharField(required=False, allow_blank=True, write_only=True)
    cpf = serializers.CharField(required=True, allow_blank=False, write_only=True)
    telefone = serializers.CharField(required=False, allow_blank=True, write_only=True)
    nacionalidade = serializers.CharField(required=False, allow_blank=True, write_only=True)
    profissao = serializers.CharField(required=False, allow_blank=True, write_only=True)
    estado_civil = serializers.ChoiceField(
        choices=ESTADOS_CIVIS, required=False, allow_blank=True, write_only=True
    )
    
    # Endereço
    rua = serializers.CharField(required=False, allow_blank=True, write_only=True)
    numero = serializers.CharField(required=False, allow_blank=True, write_only=True)
    complemento = serializers.CharField(required=False, allow_blank=True, write_only=True)
    bairro = serializers.CharField(required=False, allow_blank=True, write_only=True)
    cep = serializers.CharField(required=False, allow_blank=True, write_only=True)
    cidade = serializers.CharField(required=False, allow_blank=True, write_only=True)
    estado = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password',
            'nome', 'cpf', 'telefone', 'nacionalidade', 'profissao', 'estado_civil',
            'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado'
        ]
        read_only_fields = ['id']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        nome = getattr(getattr(instance, 'perfil', None), 'nome', '')
        data['username'] = primeiro_nome(nome) if nome else ''
        return data

    def validate_cpf(self, value):
        cpf = normalizar_cpf(value)

        # CPF-VALIDACAO: valida o CPF informado no cadastro de usuário.
        if not cpf_valido(cpf):
            raise serializers.ValidationError('CPF inválido. Verifique os dígitos informados.')

        for perfil in PerfilUsuario.objects.only('cpf'):
            if normalizar_cpf(perfil.cpf) == cpf:
                raise serializers.ValidationError('Já existe um usuário cadastrado com este CPF.')

        return formatar_cpf(cpf)

    def validate_telefone(self, value):
        if not telefone_valido(value):
            raise serializers.ValidationError(
                'Telefone inválido. Use celular (XX) XXXXX-XXXX ou fixo (XX) XXXX-XXXX.'
            )
        return formatar_telefone(value)

    def create(self, validated_data):
        # Extrair dados do perfil
        nome = validated_data.pop('nome', '')
        cpf = validated_data.pop('cpf', '')
        telefone = validated_data.pop('telefone', '')
        nacionalidade = validated_data.pop('nacionalidade', '')
        profissao = validated_data.pop('profissao', '')
        estado_civil = validated_data.pop('estado_civil', '')
        rua = validated_data.pop('rua', '')
        numero = validated_data.pop('numero', '')
        complemento = validated_data.pop('complemento', '')
        bairro = validated_data.pop('bairro', '')
        cep = validated_data.pop('cep', '')
        cidade = validated_data.pop('cidade', '')
        estado = validated_data.pop('estado', '')
        
        # Criar usuário
        user = User.objects.create_user(
            username=normalizar_cpf(cpf),
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
            rua=rua,
            numero=numero,
            complemento=complemento,
            bairro=bairro,
            cep=cep,
            cidade=cidade,
            estado=estado
        )
        
        return user
    
# cliente
class ClienteSerializer(CPFSerializerMixin, serializers.ModelSerializer):
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
