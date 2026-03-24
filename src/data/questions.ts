export interface Question {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string | null;
  option_e: string | null;
  correct_option: string;
  category: string;
}

export const examQuestions: Question[] = [
  // Interruptores Wi-Fi (5 perguntas)
  {
    question_text: "Ao instalar um interruptor Wi-Fi em uma rede doméstica com roteador dual-band, qual a recomendação técnica para garantir a estabilidade da conexão?",
    option_a: "Conectar na banda de 5 GHz para maior velocidade",
    option_b: "Conectar na banda de 2.4 GHz para maior alcance e compatibilidade",
    option_c: "Usar qualquer banda disponível, pois não há diferença",
    option_d: "Desabilitar a banda de 5 GHz completamente no roteador",
    option_e: "Criar uma rede mesh exclusiva para o interruptor",
    correct_option: "b",
    category: "Interruptor Wi-Fi"
  },
  {
    question_text: "Um interruptor Wi-Fi requer fio neutro na instalação. Ao abrir a caixa 4x2, você encontra apenas fase e retorno. Qual a solução técnica correta?",
    option_a: "Utilizar um interruptor Wi-Fi que não necessita de neutro",
    option_b: "Puxar o neutro do quadro de distribuição até a caixa",
    option_c: "Conectar o fio terra como neutro",
    option_d: "Ambas as opções A e B são válidas",
    option_e: "Instalar um capacitor para compensar a falta do neutro",
    correct_option: "d",
    category: "Interruptor Wi-Fi"
  },
  {
    question_text: "Qual o procedimento correto ao configurar um interruptor Wi-Fi touch com associação de cenas no aplicativo Tuya/Smart Life?",
    option_a: "Criar a cena diretamente no interruptor sem usar o app",
    option_b: "Associar o interruptor a uma cena automática com condição de acionamento e dispositivos de resposta",
    option_c: "Resetar o interruptor antes de cada criação de cena",
    option_d: "As cenas só funcionam com assistente de voz",
    option_e: null,
    correct_option: "b",
    category: "Interruptor Wi-Fi"
  },
  {
    question_text: "Ao substituir um interruptor convencional por um Wi-Fi em um circuito three-way (paralelo), qual é o procedimento correto?",
    option_a: "Manter a instalação three-way original e adicionar o módulo Wi-Fi em paralelo",
    option_b: "Remover a instalação three-way e utilizar dois módulos Wi-Fi com vinculação por app",
    option_c: "Conectar os dois interruptores Wi-Fi nos mesmos fios do three-way convencional",
    option_d: "Usar apenas um interruptor Wi-Fi e eliminar o segundo ponto",
    option_e: "Instalar um relé auxiliar entre os dois pontos",
    correct_option: "b",
    category: "Interruptor Wi-Fi"
  },
  {
    question_text: "Um interruptor Wi-Fi apresenta desconexões frequentes. Qual diagnóstico deve ser priorizado?",
    option_a: "Verificar a intensidade do sinal Wi-Fi (RSSI) no local da instalação",
    option_b: "Trocar o interruptor por um modelo mais caro",
    option_c: "Reinstalar o aplicativo no celular do cliente",
    option_d: "Verificar se o firmware do interruptor está atualizado e o RSSI do sinal",
    option_e: "Desligar e religar o disjuntor",
    correct_option: "d",
    category: "Interruptor Wi-Fi"
  },

  // Interruptores Zigbee (5 perguntas)
  {
    question_text: "Qual a principal diferença técnica entre um interruptor Zigbee e um Wi-Fi em termos de arquitetura de rede?",
    option_a: "Zigbee conecta diretamente ao roteador Wi-Fi",
    option_b: "Zigbee requer um hub/gateway como coordenador da rede mesh Zigbee",
    option_c: "Wi-Fi tem maior alcance que Zigbee em todos os casos",
    option_d: "Zigbee opera na frequência de 5 GHz",
    option_e: "Não há diferença, ambos funcionam da mesma forma",
    correct_option: "b",
    category: "Interruptor Zigbee"
  },
  {
    question_text: "Em uma rede Zigbee, qual é a função de um dispositivo 'router' e como os interruptores alimentados pela rede elétrica contribuem?",
    option_a: "Routers apenas recebem comandos, não retransmitem",
    option_b: "Interruptores Zigbee alimentados pela rede atuam como routers, expandindo o alcance da malha mesh",
    option_c: "Apenas o gateway pode atuar como router",
    option_d: "Dispositivos a bateria são os melhores routers",
    option_e: "Routers Zigbee precisam de conexão Wi-Fi adicional",
    correct_option: "b",
    category: "Interruptor Zigbee"
  },
  {
    question_text: "Ao integrar um interruptor Zigbee 3.0 com um hub que suporta apenas Zigbee HA (Home Automation), o que pode ocorrer?",
    option_a: "Compatibilidade total garantida, pois Zigbee 3.0 é retrocompatível com Zigbee HA",
    option_b: "Incompatibilidade total, nenhum dispositivo funcionará",
    option_c: "Compatibilidade parcial — funções básicas funcionam mas recursos avançados podem não ser suportados",
    option_d: "O hub será atualizado automaticamente para Zigbee 3.0",
    option_e: null,
    correct_option: "c",
    category: "Interruptor Zigbee"
  },
  {
    question_text: "Qual é o procedimento correto para emparelhar um interruptor Zigbee que não está sendo detectado pelo gateway?",
    option_a: "Reiniciar o roteador Wi-Fi",
    option_b: "Realizar o reset de fábrica do interruptor e colocar o gateway em modo de pareamento antes de tentar novamente",
    option_c: "Aproximar o celular do interruptor",
    option_d: "Instalar um repetidor Wi-Fi próximo",
    option_e: "Trocar as pilhas do gateway",
    correct_option: "b",
    category: "Interruptor Zigbee"
  },
  {
    question_text: "Em uma instalação com 30+ dispositivos Zigbee, qual a recomendação para otimizar a malha e evitar congestionamento?",
    option_a: "Concentrar todos os dispositivos próximos ao gateway",
    option_b: "Distribuir dispositivos roteadores (alimentados pela rede) estrategicamente para criar caminhos redundantes na malha",
    option_c: "Limitar a rede a 15 dispositivos por gateway",
    option_d: "Usar apenas dispositivos de um único fabricante",
    option_e: "Desabilitar o recurso de mesh",
    correct_option: "b",
    category: "Interruptor Zigbee"
  },

  // Controlador Universal IR/RF (4 perguntas)
  {
    question_text: "Ao configurar um controlador universal IR (infravermelho) para operar um ar-condicionado, o aparelho não responde aos comandos. Qual o primeiro diagnóstico?",
    option_a: "Verificar se o LED IR do controlador está apontado diretamente para o receptor do ar-condicionado, sem obstruções",
    option_b: "Trocar o controlador por um modelo mais potente",
    option_c: "Resetar o ar-condicionado desligando o disjuntor",
    option_d: "Verificar posicionamento do IR, ângulo de alcance e testar com a câmera do celular se o LED IR está emitindo",
    option_e: "Instalar um repetidor IR",
    correct_option: "d",
    category: "Controlador Universal"
  },
  {
    question_text: "Qual a diferença fundamental entre controle por IR e RF em um controlador universal, e quando usar cada um?",
    option_a: "IR tem maior alcance que RF",
    option_b: "IR requer linha de visão direta; RF atravessa paredes e não precisa de visão direta",
    option_c: "RF é mais barato que IR em todos os casos",
    option_d: "Ambos funcionam exatamente da mesma forma",
    option_e: "RF só funciona com dispositivos da mesma marca",
    correct_option: "b",
    category: "Controlador Universal"
  },
  {
    question_text: "Um controlador universal IR precisa ser instalado em uma sala com múltiplos equipamentos (TV, ar-condicionado, receiver). Qual o posicionamento ideal?",
    option_a: "Atrás da TV, escondido",
    option_b: "Em posição central com linha de visão para todos os receptores IR dos equipamentos",
    option_c: "Dentro de um armário fechado",
    option_d: "Colado ao teto, voltado para cima",
    option_e: "Ao lado de apenas um equipamento",
    correct_option: "b",
    category: "Controlador Universal"
  },
  {
    question_text: "Durante o aprendizado de comandos IR em um controlador universal, o processo de clonagem de um botão do controle original falha repetidamente. Qual a causa mais provável?",
    option_a: "O controle original está com pilhas novas demais",
    option_b: "Distância inadequada entre o controle original e o sensor de aprendizagem do controlador, ou interferência de luz solar/fluorescente",
    option_c: "O controlador universal não suporta IR",
    option_d: "É necessário conectar o controlador ao Wi-Fi antes",
    option_e: "O controle original precisa ser da mesma marca",
    correct_option: "b",
    category: "Controlador Universal"
  },

  // Fechadura Digital (4 perguntas)
  {
    question_text: "Ao instalar uma fechadura digital em uma porta de madeira, qual a espessura mínima recomendada da porta e por quê?",
    option_a: "20mm — qualquer porta serve",
    option_b: "35-40mm — para garantir estrutura adequada para o mecanismo e evitar flexão que comprometa o travamento",
    option_c: "50mm — somente portas reforçadas",
    option_d: "Não há espessura mínima",
    option_e: "60mm — padrão internacional obrigatório",
    correct_option: "b",
    category: "Fechadura Digital"
  },
  {
    question_text: "Uma fechadura digital com desbloqueio via Bluetooth apresenta latência alta (>5 segundos). Quais verificações devem ser feitas?",
    option_a: "Verificar nível das pilhas/bateria, versão do Bluetooth do celular e presença de interferências (outros dispositivos BLE próximos)",
    option_b: "Trocar a fechadura imediatamente",
    option_c: "Atualizar o sistema operacional do celular",
    option_d: "Reiniciar o roteador Wi-Fi",
    option_e: "Aumentar o volume do celular",
    correct_option: "a",
    category: "Fechadura Digital"
  },
  {
    question_text: "Qual a importância do ajuste correto do 'backset' (distância do centro do cilindro à borda da porta) na instalação de uma fechadura digital?",
    option_a: "Não tem importância, é apenas estético",
    option_b: "O backset incorreto impede o encaixe correto do mecanismo, causando falhas no travamento e desgaste prematuro",
    option_c: "Afeta apenas a aparência da fechadura",
    option_d: "Só é relevante para portas de vidro",
    option_e: null,
    correct_option: "b",
    category: "Fechadura Digital"
  },
  {
    question_text: "Ao cadastrar múltiplas digitais em uma fechadura biométrica, qual a melhor prática para garantir reconhecimento confiável?",
    option_a: "Cadastrar apenas um dedo por usuário",
    option_b: "Cadastrar o mesmo dedo 2-3 vezes em ângulos ligeiramente diferentes e incluir um dedo secundário como backup",
    option_c: "Cadastrar todos os 10 dedos de cada usuário",
    option_d: "Usar apenas o dedo indicador",
    option_e: "Cadastrar com os dedos molhados para melhor leitura",
    correct_option: "b",
    category: "Fechadura Digital"
  },

  // Interfone Inteligente (3 perguntas)
  {
    question_text: "Ao instalar um interfone inteligente com vídeo (video doorbell) conectado ao Wi-Fi, qual a largura de banda mínima de upload recomendada para streaming em tempo real?",
    option_a: "0.5 Mbps é suficiente",
    option_b: "Mínimo de 2 Mbps de upload para vídeo em qualidade aceitável, idealmente 4+ Mbps para HD",
    option_c: "100 Mbps de download é o único requisito",
    option_d: "A velocidade da internet não importa",
    option_e: "1 Gbps de upload é o mínimo",
    correct_option: "b",
    category: "Interfone Inteligente"
  },
  {
    question_text: "Em uma instalação de interfone IP com sistema de abertura de portão/fechadura elétrica, qual o cuidado essencial na fiação do relé de acionamento?",
    option_a: "Conectar diretamente na tomada 220V",
    option_b: "Isolar corretamente os circuitos de baixa tensão (interfone) e alta tensão (fechadura/portão), respeitando a capacidade do relé",
    option_c: "Usar fio fino para economizar material",
    option_d: "Não é necessário relé, basta conectar direto",
    option_e: "Usar emenda simples sem isolação",
    correct_option: "b",
    category: "Interfone Inteligente"
  },
  {
    question_text: "Um interfone inteligente instalado em área externa apresenta falhas após chuvas. Qual classificação IP mínima recomendada e qual cuidado adicional?",
    option_a: "IP20 — proteção básica é suficiente",
    option_b: "IP65 ou superior — proteção contra jatos d'água, e instalar com leve inclinação para evitar acúmulo de água nos conectores",
    option_c: "Não existe classificação IP para interfones",
    option_d: "Basta cobrir com plástico",
    option_e: "IP44 com silicone nas bordas",
    correct_option: "b",
    category: "Interfone Inteligente"
  },

  // Fita de LED (4 perguntas)
  {
    question_text: "Ao instalar uma fita de LED RGB+W de 5 metros em um sanca de gesso, a fita apresenta variação de cor/brilho no final do percurso. Qual a causa e solução?",
    option_a: "A fita está com defeito e precisa ser trocada",
    option_b: "Queda de tensão ao longo da fita — solução: alimentar por ambas as extremidades ou usar injeção de energia a cada 5m",
    option_c: "É comportamento normal de fitas LED",
    option_d: "Trocar por uma fita mais curta",
    option_e: "Aumentar a tensão da fonte para compensar",
    correct_option: "b",
    category: "Fita de LED"
  },
  {
    question_text: "Qual o cálculo correto para dimensionar a fonte de alimentação de uma fita LED de 14.4W/m com 8 metros de comprimento?",
    option_a: "14.4W × 8m = 115.2W, usar fonte de 115W",
    option_b: "14.4W × 8m = 115.2W, adicionar margem de 20% = ~138W, usar fonte de 150W",
    option_c: "Usar qualquer fonte de 12V disponível",
    option_d: "14.4W × 8m = 115.2W, usar fonte de 100W",
    option_e: "Não é necessário calcular, toda fonte serve",
    correct_option: "b",
    category: "Fita de LED"
  },
  {
    question_text: "Ao instalar uma fita de LED endereçável (tipo WS2812B) com controlador Wi-Fi, qual a tensão de operação e cuidado especial com a fiação?",
    option_a: "12V com qualquer fio",
    option_b: "5V DC — usar fios de seção adequada (mínimo 1.5mm²) para evitar queda de tensão, e respeitar a direção do fluxo de dados (seta indicativa na fita)",
    option_c: "220V AC direto",
    option_d: "24V com fio de 0.5mm²",
    option_e: "A tensão não importa para fitas endereçáveis",
    correct_option: "b",
    category: "Fita de LED"
  },
  {
    question_text: "Qual a importância do perfil de alumínio na instalação de fitas LED e quando ele é obrigatório?",
    option_a: "É apenas decorativo, nunca é necessário",
    option_b: "Dissipa o calor gerado pela fita, prolongando a vida útil — essencial para fitas de alta potência (>10W/m) e instalações embutidas",
    option_c: "Só serve para fitas RGB",
    option_d: "Substitui a fonte de alimentação",
    option_e: "É obrigatório apenas em áreas externas",
    correct_option: "b",
    category: "Fita de LED"
  },

  // Sensor de Presença (3 perguntas)
  {
    question_text: "Qual a diferença técnica entre um sensor de presença PIR e um sensor de presença por micro-ondas, e quando usar cada um?",
    option_a: "São idênticos em funcionamento",
    option_b: "PIR detecta calor/movimento de corpos — ideal para ambientes internos; micro-ondas detecta qualquer movimento (inclusive atrás de divisórias finas) — ideal para áreas com obstáculos",
    option_c: "Micro-ondas é sempre melhor que PIR",
    option_d: "PIR funciona apenas durante o dia",
    option_e: "Micro-ondas requer conexão Wi-Fi",
    correct_option: "b",
    category: "Sensor de Presença"
  },
  {
    question_text: "Ao instalar um sensor de presença inteligente (Wi-Fi/Zigbee) em um banheiro, qual o ajuste crítico de temporização?",
    option_a: "Manter o padrão de fábrica de 30 segundos",
    option_b: "Configurar tempo de permanência prolongado (5-10 min) para evitar que a luz apague durante o uso, e ajustar a sensibilidade para detectar movimentos sutis",
    option_c: "Usar o menor tempo possível (5 segundos)",
    option_d: "Desabilitar a temporização",
    option_e: "Configurar para acionar apenas uma vez",
    correct_option: "b",
    category: "Sensor de Presença"
  },
  {
    question_text: "Um sensor de presença PIR instalado próximo a uma janela com incidência solar direta apresenta acionamentos falsos. Qual a solução?",
    option_a: "Trocar o sensor por um modelo mais barato",
    option_b: "Reposicionar o sensor para evitar a incidência direta de luz solar/calor, ou instalar anteparo para bloquear a radiação infravermelha solar",
    option_c: "Cobrir a janela permanentemente",
    option_d: "Aumentar a sensibilidade do sensor",
    option_e: "Instalar dois sensores no mesmo local",
    correct_option: "b",
    category: "Sensor de Presença"
  },

  // Sensor de Movimento (2 perguntas)
  {
    question_text: "Em uma automação residencial, qual a integração mais eficiente entre sensor de movimento Zigbee e iluminação inteligente para um corredor?",
    option_a: "Conectar o sensor diretamente na fiação da lâmpada",
    option_b: "Criar automação no gateway: sensor detecta → aciona grupo de lâmpadas com brilho/cor programados por horário (claro de dia, suave à noite)",
    option_c: "Usar timer fixo em vez de sensor",
    option_d: "Instalar interruptor convencional como backup único",
    option_e: "Programar o sensor para funcionar apenas de madrugada",
    correct_option: "b",
    category: "Sensor de Movimento"
  },
  {
    question_text: "Qual o ângulo de detecção e altura de instalação recomendados para um sensor de movimento PIR em um corredor de 1.2m de largura?",
    option_a: "Ângulo de 360° a 5 metros de altura",
    option_b: "Ângulo de 90-120° instalado a 2.0-2.4m de altura, apontado perpendicularmente ao fluxo de passagem para máxima detecção",
    option_c: "Qualquer ângulo, no nível do chão",
    option_d: "180° instalado no teto a 4m",
    option_e: "45° instalado atrás de um móvel",
    correct_option: "b",
    category: "Sensor de Movimento"
  },
];
