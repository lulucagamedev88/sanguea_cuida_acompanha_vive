# SANGUEA
### Cuida. Acompanha. Vive.

**Uma aplicação de apoio diário para pessoas que vivem com doença falciforme.**

A Sanguea é um projecto independente concebido para acompanhar pessoas com doença falciforme nas diferentes fases da vida, promovendo hábitos saudáveis, organização dos cuidados diários e maior consciência sobre a própria saúde.

Desenvolvida com foco na acessibilidade, experiência do utilizador, privacidade e autonomia, a aplicação procura tornar o acompanhamento quotidiano mais simples, organizado e próximo das necessidades reais dos seus utilizadores.

---

## Sobre o projecto

A doença falciforme exige atenção contínua. A hidratação, a organização da medicação, a observação dos sintomas e o acompanhamento dos cuidados diários podem representar desafios significativos.

A Sanguea nasce com o propósito de reunir ferramentas úteis num único espaço digital, proporcionando uma experiência adaptável a crianças, adolescentes e adultos.

O projecto tem origem em Angola e pretende desenvolver uma solução com identidade própria, capaz de evoluir e alcançar diferentes comunidades.

## Funcionalidades

A aplicação reúne ferramentas de apoio e acompanhamento diário, incluindo:

- **Perfis pessoais:** organização de informações e personalização da experiência.
- **Hidratação:** registo e acompanhamento do consumo diário de água.
- **Medicação:** organização de planos e registo das tomas.
- **Acompanhamento diário:** ferramentas para registar informações relevantes sobre os cuidados pessoais.
- **Gestão de sintomas e rotinas:** apoio à organização das informações do utilizador.
- **Definições e personalização:** temas visuais e preferências de som.
- **Aqua Quest:** experiência de jogo integrada, concebida para incentivar hábitos de hidratação e escolhas saudáveis.

As funcionalidades podem evoluir ao longo do desenvolvimento do projecto.

## Aqua Quest

O Aqua Quest é o módulo de jogo integrado na Sanguea.

Através de uma abordagem lúdica, procura transformar hábitos de hidratação e escolhas alimentares em experiências mais envolventes, especialmente para os utilizadores mais jovens.

O seu propósito é complementar a experiência da aplicação através da aprendizagem e da motivação.

## Privacidade e segurança

A privacidade dos dados pessoais e de saúde constitui um dos princípios fundamentais da Sanguea.

A arquitectura actual utiliza:

- IndexedDB para armazenamento local.
- Cifragem AES-GCM de 256 bits.
- Derivação de chaves através de PBKDF2 com SHA-256.
- Gestão de chaves e sessões no contexto da aplicação.
- Estratégia local-first, sem dependência de uma base de dados externa para o armazenamento principal dos registos.

A segurança é tratada como parte integrante da arquitectura, não apenas como uma funcionalidade adicional.

**Nota:** a protecção dos dados depende também da segurança do dispositivo e da gestão adequada das credenciais pelo utilizador.

## Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| React | Interface da aplicação |
| TypeScript | Tipagem e organização do código |
| Vite | Desenvolvimento e compilação |
| Tailwind CSS 4 | Estilização |
| IndexedDB | Armazenamento local |
| Web Crypto API | Operações criptográficas |
| Capacitor | Integração com Android |
| vite-plugin-pwa | Funcionalidades PWA |

## Executar localmente

### Pré-requisitos

- Node.js 20 ou superior.
- npm.
- Git.

### 1. Clonar o repositório

```bash
git clone https://github.com/lulucagamedev88/sanguea_cuida_acompanha_vive.git
```

### 2. Entrar na pasta

```bash
cd sanguea_cuida_acompanha_vive
```

### 3. Instalar dependências

```bash
npm install --legacy-peer-deps
```

### 4. Iniciar o ambiente de desenvolvimento

```bash
npm run dev
```

O Vite apresentará no terminal o endereço local para abrir a aplicação no navegador.

### 5. Validar o projecto

Verificação de TypeScript:

```bash
npm run lint
```

Compilação:

```bash
npm run build
```

## Plataforma

A Sanguea está orientada para Android, com uma arquitectura baseada em tecnologias web.

O projecto também contempla uma experiência PWA, permitindo explorar a aplicação através de um navegador compatível.

## Responsabilidade médica

A Sanguea é uma ferramenta de apoio à organização e ao acompanhamento pessoal.

**Não substitui consultas médicas, exames, diagnóstico, prescrição ou acompanhamento por profissionais de saúde.**

Em situações de emergência, o utilizador deve procurar assistência médica adequada.

## Estado do projecto

**Desenvolvimento activo.**

A aplicação encontra-se em evolução, com funcionalidades de acompanhamento diário, personalização, segurança e integração do Aqua Quest.

Novas melhorias serão introduzidas progressivamente, preservando a estabilidade e a integridade dos dados existentes.

## Autor

**Rodrigo Luluca**

Criador e desenvolvedor independente da Sanguea.

## Identidade

**SANGUEA — Cuida. Acompanha. Vive.**

Tecnologia com propósito. Cuidado com humanidade.
