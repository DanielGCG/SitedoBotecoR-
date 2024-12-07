console.log("Processando imagem do dia...");
require('dotenv').config();


const admin = require("firebase-admin");
const dayjs = require("dayjs");
const { CronJob } = require("cron");
const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};



// Inicializar Firebase com Storage e Database
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "boteco-6fcfa.appspot.com", // Para o Storage
  databaseURL: "https://boteco-6fcfa-default-rtdb.firebaseio.com" // Para o Realtime Database (se necessário)
});

const storage = admin.storage().bucket();

// Função para processar imagens do dia
async function processarImagemDoDia() {
  const pasta = "imagensdodia/"; // Caminho da pasta onde as imagens são armazenadas

  try {
    // Listar todas as imagens na pasta
    const [arquivos] = await storage.getFiles({ prefix: pasta });
    const imagens = arquivos.filter(arquivo => arquivo.name.endsWith(".gif") || arquivo.name.endsWith(".png"));

    if (imagens.length === 0) {
      console.log("Nenhuma imagem encontrada na pasta.");
      return;
    }

    // Ordenar imagens por data de criação (assumindo que a data está no nome do arquivo)
    imagens.sort((a, b) => {
      const nomeA = a.name.split("/").pop();
      const nomeB = b.name.split("/").pop();

      const dataA = new Date(nomeA.split("-").slice(0, 3).join("-")); // Data no formato YYYY-MM-DD
      const dataB = new Date(nomeB.split("-").slice(0, 3).join("-")); // Data no formato YYYY-MM-DD

      return dataA - dataB;
    });

    const agora = dayjs();

    for (let i = 0; i < imagens.length; i++) {
      const imagem = imagens[i];
      const nomeAtual = imagem.name.split("/").pop();

      if (nomeAtual.startsWith("imagemdodia-")) {
        const dataImagem = dayjs(nomeAtual.split("-")[1]);
        const horasDiferenca = agora.diff(dataImagem, "hour");

        if (horasDiferenca > 24 && imagens.length > 1) {
          console.log(`Removendo imagem mais antiga: ${imagem.name}`);
          await storage.file(imagem.name).delete();
        } else {
          console.log("A imagem atual ainda é válida como imagemdodia.");
          return;
        }
      }
    }

    // Atualizar a próxima imagem como imagemdodia
    const novaImagem = imagens[0];
    const novoNome = `${pasta}imagemdodia-${novaImagem.name.split("/").pop()}`;

    console.log(`Renomeando ${novaImagem.name} para ${novoNome}`);
    const [arquivo] = await storage.file(novaImagem.name).download();

    const novoArquivo = storage.file(novoNome);
    await novoArquivo.save(arquivo);
    await novoArquivo.makePublic();

    console.log(`Nova imagem do dia: ${novoNome}`);
    await storage.file(novaImagem.name).delete();
  } catch (error) {
    console.error("Erro ao processar imagens do dia:", error);
  }
}

// Agendar a tarefa para rodar a cada minuto
const job = new CronJob(
  "* * * * *", // Cron expression para rodar à meia-noite
  () => {
    console.log("Executando tarefa agendada: processarImagemDoDia");
    processarImagemDoDia();
  },
  null,
  true, // Iniciar o job automaticamente
  "America/Sao_Paulo" // Fuso horário
);

console.log("Tarefa agendada para rodar a cada minuto");

module.exports = { processarImagemDoDia };