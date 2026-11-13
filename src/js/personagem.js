const API_URL = "https://digi-api.com/api/v1/digimon";

const personagem = document.getElementById("personagem");
const carregando = document.getElementById("carregando");
const btnAnterior = document.getElementById("btnAnterior");
const btnProximo = document.getElementById("btnProximo");

let idAtual = null;
let navegando = false;

const parametros = new URLSearchParams(window.location.search);

const nome = parametros.get("nome");

async function carregarDigimon() {
  if (!nome) {
    carregando.innerHTML = "Digimon não encontrado.";
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/${encodeURIComponent(nome)}`);

    if (!resposta.ok) {
      throw new Error("Digimon não encontrado.");
    }

    const digimon = await resposta.json();

    console.log("DADOS DO DIGIMON:", digimon);

    idAtual = Number(digimon.id);

    mostrarDigimon(digimon);
  } catch (erro) {
    console.error(erro);

    carregando.innerHTML = `
            <div class="erro">
                <h2>Não foi possível carregar este Digimon.</h2>
                <p>Verifique sua conexão com a internet.</p>
            </div>
        `;
  }
}

function pegarLista(lista, propriedades) {
  if (!Array.isArray(lista)) {
    return "Não informado";
  }

  const valores = lista
    .map(function (item) {
      if (typeof item === "string") {
        return item;
      }

      for (const propriedade of propriedades) {
        if (item && item[propriedade]) {
          return item[propriedade];
        }
      }

      return "";
    })
    .filter(Boolean);

  if (valores.length === 0) {
    return "Não informado";
  }

  return [...new Set(valores)].join(", ");
}

function pegarDescricao(descricoes) {
  if (!Array.isArray(descricoes)) {
    return "Descrição não disponível.";
  }

  // Primeiro tenta português
  let descricao = descricoes.find(function (item) {
    return (
      item.language === "Portuguese" ||
      item.language === "Português" ||
      item.language === "pt-BR" ||
      item.language === "pt"
    );
  });

  // Depois tenta inglês
  if (!descricao) {
    descricao = descricoes.find(function (item) {
      return item.language === "English" || item.language === "en";
    });
  }

  // Por último pega a primeira disponível
  if (!descricao) {
    descricao = descricoes[0];
  }

  if (typeof descricao === "string") {
    return descricao;
  }

  return descricao.description || descricao.text || "Descrição não disponível.";
}

function pegarImagem(digimon) {
  // Formato usado pela lista
  if (digimon.image) {
    return digimon.image;
  }

  // Caso a API retorne uma lista de imagens
  if (Array.isArray(digimon.images) && digimon.images.length > 0) {
    const primeira = digimon.images[0];

    if (typeof primeira === "string") {
      return primeira;
    }

    return primeira.href || primeira.url || primeira.image || primeira.src;
  }

  return "";
}

function traduzirNivel(valor) {
  const traducoes = {
    Child: "Novato",
    Rookie: "Novato",

    "In-Training": "Em treinamento",

    Fresh: "Recém-nascido",

    Champion: "Campeão",

    Ultimate: "Ultimate",

    Mega: "Mega",

    Armor: "Armadura",

    Hybrid: "Híbrido",
  };

  return traducoes[valor] || valor;
}

function traduzirTipo(valor) {
  const traducoes = {
    Reptile: "Réptil",

    Mammal: "Mamífero",

    Bird: "Ave",

    Insectoid: "Inseto",

    Insect: "Inseto",

    Vegetation: "Vegetação",

    "Sea Animal": "Animal Marinho",

    Aquatic: "Aquático",

    "Mini Dragon": "Mini Dragão",

    Dragon: "Dragão",

    Beast: "Fera",

    Holy: "Sagrado",

    Demon: "Demônio",

    Machine: "Máquina",

    Mutant: "Mutante",

    Warrior: "Guerreiro",

    Fairy: "Fada",

    "Bird Dragon": "Dragão Ave",

    Plant: "Planta",

    Insect: "Inseto",
  };

  return traducoes[valor] || valor;
}

function traduzirAtributo(valor) {
  const traducoes = {
    Vaccine: "Vacina",

    Data: "Dados",

    Virus: "Vírus",

    Free: "Livre",

    Variable: "Variável",
  };

  return traducoes[valor] || valor;
}

function criarHabilidades(skills) {
  if (!Array.isArray(skills) || skills.length === 0) {
    return "<p>Nenhuma habilidade informada.</p>";
  }

  let html = "<ul>";

  skills.forEach(function (habilidade) {
    const nomeHabilidade = habilidade.skill || habilidade.name || "Habilidade";

    const descricao = habilidade.description || "";

    html += `
            <li>
                <strong>${nomeHabilidade}</strong>

                ${descricao ? `<p>${descricao}</p>` : ""}
            </li>
        `;
  });

  html += "</ul>";

  return html;
}

function mostrarDigimon(digimon) {
  carregando.style.display = "none";

  const numero = String(digimon.id).padStart(3, "0");

  const imagem = pegarImagem(digimon);

  const tiposBrutos = pegarLista(digimon.types, ["type", "name"]);

  const tipos = tiposBrutos.split(", ").map(traduzirTipo).join(", ");

  const niveisBrutos = pegarLista(digimon.levels, ["level", "name"]);

  const niveis = niveisBrutos.split(", ").map(traduzirNivel).join(", ");

  const atributosBrutos = pegarLista(digimon.attributes, ["attribute", "name"]);

  const atributos = atributosBrutos
    .split(", ")
    .map(traduzirAtributo)
    .join(", ");

  const campos = pegarLista(digimon.fields, ["field", "name"]);

  const descricao = pegarDescricao(digimon.descriptions);

  const habilidades = criarHabilidades(digimon.skills);

  personagem.innerHTML = `

        <span class="numero personagem-numero">
            #${numero}
        </span>


        <h2>
            ${digimon.name}
        </h2>


        ${
          imagem
            ? `
                    <img
                        class="personagem-imagem"
                        src="${imagem}"
                        alt="${digimon.name}"
                    >
                `
            : `
                    <div class="sem-imagem">
                        Imagem não disponível
                    </div>
                `
        }


        <div class="informacoes">

            <div class="info-item">

                <strong>
                    Tipo
                </strong>

                <p>
                    ${tipos}
                </p>

            </div>


            <div class="info-item">

                <strong>
                    Nível
                </strong>

                <p>
                    ${niveis}
                </p>

            </div>


            <div class="info-item">

                <strong>
                    Atributo
                </strong>

                <p>
                    ${atributos}
                </p>

            </div>


            <div class="info-item">

                <strong>
                    Campos
                </strong>

                <p>
                    ${campos}
                </p>

            </div>

        </div>


        <div class="descricao-personagem">

            <h3>
                Descrição
            </h3>

            <p>
                ${descricao}
            </p>

        </div>


        <div class="habilidades-personagem">

            <h3>
                Habilidades
            </h3>

            ${habilidades}

        </div>

    `;
}

// BUSCAR DIGIMON PELO ID
async function buscarPorId(id) {
  const resposta = await fetch(`${API_URL}/${id}`);

  if (!resposta.ok) {
    return null;
  }

  return await resposta.json();
}

// NAVEGAR ENTRE OS DIGIMONS
async function navegarDigimon(direcao) {
  if (navegando || idAtual === null) {
    return;
  }

  navegando = true;

  btnAnterior.disabled = true;
  btnProximo.disabled = true;

  carregando.style.display = "block";
  carregando.innerHTML = "Carregando Digimon...";
  personagem.innerHTML = "";

  // Procura até encontrar um ID válido.
  // Limita a 20 tentativas para evitar muitas consultas.
  for (let tentativa = 1; tentativa <= 20; tentativa++) {
    const novoId = idAtual + direcao * tentativa;

    if (novoId < 1) {
      break;
    }

    try {
      const digimon = await buscarPorId(novoId);

      if (digimon) {
        idAtual = Number(digimon.id);

        mostrarDigimon(digimon);

        // Atualiza o endereço com o nome do novo Digimon.
        const novaUrl = `personagem.html?nome=${encodeURIComponent(digimon.name)}`;

        window.history.replaceState(null, "", novaUrl);

        navegando = false;

        btnAnterior.disabled = false;
        btnProximo.disabled = false;

        return;
      }
    } catch (erro) {
      console.error("Erro ao navegar:", erro);

      carregando.innerHTML = `
                <div class="erro">
                    <h2>Erro ao carregar o Digimon.</h2>
                    <p>Verifique sua conexão com a internet.</p>
                </div>
            `;

      personagem.innerHTML = "";

      navegando = false;

      btnAnterior.disabled = false;
      btnProximo.disabled = false;

      return;
    }
  }

  // Caso não encontre outro Digimon.
  carregando.style.display = "none";

  personagem.innerHTML = `
        <p class="mensagem-navegacao">
            Não encontramos outro Digimon nessa direção.
        </p>
    `;

  navegando = false;

  if (direcao === -1) {
    btnAnterior.disabled = true;
  } else {
    btnProximo.disabled = true;
  }
}

// EVENTOS DOS BOTÕES
btnAnterior.addEventListener("click", function () {
  navegarDigimon(-1);
});

btnProximo.addEventListener("click", function () {
  navegarDigimon(1);
});

carregarDigimon();
