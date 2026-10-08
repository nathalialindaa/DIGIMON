const API_URL = "https://digi-api.com/api/v1/digimon";

const personagem = document.getElementById("personagem");
const carregando = document.getElementById("carregando");

const parametros = new URLSearchParams(
    window.location.search
);

const nome = parametros.get("nome");


async function carregarDigimon() {

    if (!nome) {
        carregando.innerHTML = "Digimon não encontrado.";
        return;
    }

    try {

        const resposta = await fetch(
            `${API_URL}/${encodeURIComponent(nome)}`
        );

        if (!resposta.ok) {
            throw new Error("Digimon não encontrado.");
        }

        const digimon = await resposta.json();

        console.log("DADOS DO DIGIMON:", digimon);

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
        .map(function(item) {

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
    let descricao = descricoes.find(function(item) {

        return (
            item.language === "Portuguese" ||
            item.language === "Português" ||
            item.language === "pt-BR" ||
            item.language === "pt"
        );
    });

    // Depois tenta inglês
    if (!descricao) {

        descricao = descricoes.find(function(item) {

            return (
                item.language === "English" ||
                item.language === "en"
            );
        });
    }

    // Por último pega a primeira disponível
    if (!descricao) {
        descricao = descricoes[0];
    }

    if (typeof descricao === "string") {
        return descricao;
    }

    return (
        descricao.description ||
        descricao.text ||
        "Descrição não disponível."
    );
}


function pegarImagem(digimon) {

    // Formato usado pela lista
    if (digimon.image) {
        return digimon.image;
    }

    // Caso a API retorne uma lista de imagens
    if (
        Array.isArray(digimon.images) &&
        digimon.images.length > 0
    ) {

        const primeira = digimon.images[0];

        if (typeof primeira === "string") {
            return primeira;
        }

        return (
            primeira.href ||
            primeira.url ||
            primeira.image ||
            primeira.src
        );
    }

    return "";
}


function traduzirNivel(valor) {

    const traducoes = {

        "Child": "Novato",
        "Rookie": "Novato",

        "In-Training": "Em treinamento",

        "Fresh": "Recém-nascido",

        "Champion": "Campeão",

        "Ultimate": "Ultimate",

        "Mega": "Mega",

        "Armor": "Armadura",

        "Hybrid": "Híbrido"

    };

    return traducoes[valor] || valor;
}


function traduzirTipo(valor) {

    const traducoes = {

        "Reptile": "Réptil",

        "Mammal": "Mamífero",

        "Bird": "Ave",

        "Insectoid": "Inseto",

        "Insect": "Inseto",

        "Vegetation": "Vegetação",

        "Sea Animal": "Animal Marinho",

        "Aquatic": "Aquático",

        "Mini Dragon": "Mini Dragão",

        "Dragon": "Dragão",

        "Beast": "Fera",

        "Holy": "Sagrado",

        "Demon": "Demônio",

        "Machine": "Máquina",

        "Mutant": "Mutante",

        "Warrior": "Guerreiro",

        "Fairy": "Fada",

        "Bird Dragon": "Dragão Ave",

        "Plant": "Planta",

        "Insect": "Inseto"

    };

    return traducoes[valor] || valor;
}


function traduzirAtributo(valor) {

    const traducoes = {

        "Vaccine": "Vacina",

        "Data": "Dados",

        "Virus": "Vírus",

        "Free": "Livre",

        "Variable": "Variável"

    };

    return traducoes[valor] || valor;
}


function criarHabilidades(skills) {

    if (!Array.isArray(skills) || skills.length === 0) {
        return "<p>Nenhuma habilidade informada.</p>";
    }

    let html = "<ul>";

    skills.forEach(function(habilidade) {

        const nomeHabilidade =
            habilidade.skill ||
            habilidade.name ||
            "Habilidade";

        const descricao =
            habilidade.description ||
            "";

        html += `
            <li>
                <strong>${nomeHabilidade}</strong>

                ${
                    descricao
                        ? `<p>${descricao}</p>`
                        : ""
                }
            </li>
        `;
    });

    html += "</ul>";

    return html;
}


function mostrarDigimon(digimon) {

    carregando.style.display = "none";

    const numero =
        String(digimon.id).padStart(3, "0");

    const imagem =
        pegarImagem(digimon);

    const tiposBrutos =
        pegarLista(
            digimon.types,
            ["type", "name"]
        );

    const tipos =
        tiposBrutos
            .split(", ")
            .map(traduzirTipo)
            .join(", ");


    const niveisBrutos =
        pegarLista(
            digimon.levels,
            ["level", "name"]
        );

    const niveis =
        niveisBrutos
            .split(", ")
            .map(traduzirNivel)
            .join(", ");


    const atributosBrutos =
        pegarLista(
            digimon.attributes,
            ["attribute", "name"]
        );

    const atributos =
        atributosBrutos
            .split(", ")
            .map(traduzirAtributo)
            .join(", ");


    const campos =
        pegarLista(
            digimon.fields,
            ["field", "name"]
        );


    const descricao =
        pegarDescricao(
            digimon.descriptions
        );


    const habilidades =
        criarHabilidades(
            digimon.skills
        );


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


carregarDigimon();