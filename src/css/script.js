
const API_URL = "https://digi-api.com/api/v1/digimon";

const grid = document.getElementById("digimonGrid");
const gridPopulares = document.getElementById("digimonPopulares");
const pesquisa = document.getElementById("pesquisa");

const DIGIMONS_POR_PAGINA = 100;

let todosDigimons = [];
let digimonsFiltrados = [];
let digimonsDoTipo = [];

let paginaAtual = 1;
let totalPaginas = 1;

let tipoAtual = null;
let textoPesquisa = "";

let detalhesCache = new Map();
let solicitacaoFiltro = 0;


// ======================================
// CARREGAR TODOS OS DIGIMONS
// ======================================

async function carregarDigimons() {

    try {

        grid.innerHTML = `
            <div class="carregando">
                Carregando Digimons...
            </div>
        `;

        let pagina = 0;
        let continuar = true;

        while (continuar) {

            const resposta = await fetch(
                `${API_URL}?page=${pagina}&pageSize=100`
            );

            if (!resposta.ok) {
                throw new Error("Erro ao acessar a API.");
            }

            const dados = await resposta.json();

            if (!dados.content || dados.content.length === 0) {
                break;
            }

            todosDigimons.push(...dados.content);

            pagina++;

            grid.innerHTML = `
                <div class="carregando">
                    Carregando Digimons...
                    <br><br>
                    ${todosDigimons.length} carregados
                </div>
            `;

            if (dados.content.length < 100) {
                continuar = false;
            }
        }

        digimonsFiltrados = [...todosDigimons];

        totalPaginas = Math.ceil(
            digimonsFiltrados.length / DIGIMONS_POR_PAGINA
        );

        console.log("TOTAL DE DIGIMONS:", todosDigimons.length);

        // Carrega os destaques depois de receber a lista.
        carregarDestaques();

        mostrarPagina();

    } catch (erro) {

        console.error(erro);

        grid.innerHTML = `
            <div class="erro">
                <h3>Erro ao carregar os Digimons</h3>
                <p>Verifique sua conexão com a internet.</p>
            </div>
        `;

        if (gridPopulares) {
            gridPopulares.innerHTML = `
                <div class="erro">
                    Não foi possível carregar os destaques.
                </div>
            `;
        }
    }
}


// ======================================
// DIGIMONS EM DESTAQUE
// ======================================

function carregarDestaques() {

    if (!gridPopulares) return;

    // Digimons escolhidos para aparecer na tela inicial.
    const nomesDestaques = [
        "Agumon",
        "Gabumon",
        "Patamon",
        "Gatomon",
        "Tentomon",
        "Veemon"
    ];

    const destaques = nomesDestaques
        .map(function(nome) {

            return todosDigimons.find(function(digimon) {

                return digimon.name.toLowerCase() === nome.toLowerCase();

            });

        })
        .filter(Boolean);

    // Caso algum nome não esteja disponível na API,
    // completa os espaços com outros Digimons.
    if (destaques.length < 6) {

        todosDigimons.forEach(function(digimon) {

            if (
                destaques.length < 6 &&
                !destaques.some(item => item.id === digimon.id)
            ) {
                destaques.push(digimon);
            }

        });
    }

    mostrarDigimons(gridPopulares, destaques);
}


// ======================================
// MOSTRAR PÁGINA
// ======================================

function mostrarPagina() {

    const inicio =
        (paginaAtual - 1) * DIGIMONS_POR_PAGINA;

    const fim =
        inicio + DIGIMONS_POR_PAGINA;

    const digimonsDaPagina =
        digimonsFiltrados.slice(inicio, fim);

    mostrarDigimons(grid, digimonsDaPagina);

    mostrarPaginacao();
}


// ======================================
// MOSTRAR CARDS
// ======================================

function mostrarDigimons(container, digimons) {

    if (!container) return;

    container.innerHTML = "";

    if (digimons.length === 0) {

        container.innerHTML = `
            <div class="erro">
                <h3>Nenhum Digimon encontrado.</h3>
                <p>Tente outra pesquisa ou classificação.</p>
            </div>
        `;

        return;
    }

    digimons.forEach(function(digimon) {

        const card = document.createElement("article");

        card.classList.add("digimon-card");

        const numero = String(digimon.id).padStart(3, "0");

        card.innerHTML = `

            <span class="numero">
                #${numero}
            </span>

            <img
                src="${digimon.image || ""}"
                alt="${digimon.name}"
                loading="lazy"
            >

            <div class="digimon-info">

                <h3>${digimon.name}</h3>

                <button
                    class="info-btn"
                    data-nome="${digimon.name}"
                >
                    Ver informações
                </button>

            </div>
        `;

        container.appendChild(card);

    });

    adicionarEventosBotoes(container);
}


// ======================================
// PAGINAÇÃO
// ======================================

function mostrarPaginacao() {

    let paginacao = document.getElementById("paginacao");

    if (!paginacao) {

        paginacao = document.createElement("div");

        paginacao.id = "paginacao";

        grid.parentNode.insertBefore(
            paginacao,
            grid.nextSibling
        );
    }

    paginacao.innerHTML = "";

    totalPaginas = Math.ceil(
        digimonsFiltrados.length / DIGIMONS_POR_PAGINA
    );

    if (totalPaginas <= 1) {
        return;
    }

    // ANTERIOR

    const anterior = document.createElement("button");

    anterior.textContent = "← Anterior";
    anterior.disabled = paginaAtual === 1;

    anterior.onclick = function() {

        if (paginaAtual > 1) {

            paginaAtual--;

            mostrarPagina();

            rolarParaLista();
        }
    };

    paginacao.appendChild(anterior);


    // NÚMEROS

    for (let i = 1; i <= totalPaginas; i++) {

        const botao = document.createElement("button");

        botao.textContent = i;

        if (i === paginaAtual) {
            botao.classList.add("pagina-atual");
        }

        botao.onclick = function() {

            paginaAtual = i;

            mostrarPagina();

            rolarParaLista();
        };

        paginacao.appendChild(botao);
    }


    // PRÓXIMA

    const proximo = document.createElement("button");

    proximo.textContent = "Próxima →";
    proximo.disabled = paginaAtual === totalPaginas;

    proximo.onclick = function() {

        if (paginaAtual < totalPaginas) {

            paginaAtual++;

            mostrarPagina();

            rolarParaLista();
        }
    };

    paginacao.appendChild(proximo);
}


function rolarParaLista() {

    document.getElementById("lista").scrollIntoView({
        behavior: "smooth"
    });
}


// ======================================
// ABRIR INFORMAÇÕES DO DIGIMON
// ======================================

function adicionarEventosBotoes(container) {

    const botoes = container.querySelectorAll(".info-btn");

    botoes.forEach(function(botao) {

        botao.onclick = function() {

            const nome = botao.getAttribute("data-nome");

            window.location.href =
                "personagem.html?nome=" +
                encodeURIComponent(nome);
        };
    });
}


// ======================================
// NORMALIZAR CLASSIFICAÇÕES
// ======================================

function normalizarTipo(tipo) {

    return String(tipo || "")
        .trim()
        .toLowerCase();
}


// ======================================
// EXTRAIR CLASSIFICAÇÕES
// ======================================

function extrairTipos(digimon) {

    const origem = digimon.types || digimon.type || [];

    const lista = Array.isArray(origem)
        ? origem
        : [origem];

    return lista.map(function(item) {

        if (typeof item === "string") {
            return normalizarTipo(item);
        }

        return normalizarTipo(
            item?.type ||
            item?.name ||
            item?.value
        );

    }).filter(Boolean);
}


// ======================================
// OBTER CLASSIFICAÇÃO DO DIGIMON
// ======================================

async function obterTipos(digimon) {

    // Primeiro tenta aproveitar os dados da listagem.
    const tiposLista = extrairTipos(digimon);

    if (tiposLista.length > 0) {
        return tiposLista;
    }

    // Verifica se os detalhes já foram consultados.
    if (detalhesCache.has(digimon.id)) {
        return detalhesCache.get(digimon.id);
    }

    // Consulta os detalhes individuais somente quando necessário.
    const resposta = await fetch(
        `${API_URL}/${digimon.id}`
    );

    if (!resposta.ok) {
        throw new Error("Erro ao consultar " + digimon.name);
    }

    const detalhes = await resposta.json();

    const tipos = extrairTipos(detalhes);

    detalhesCache.set(digimon.id, tipos);

    return tipos;
}


// ======================================
// FILTRAR POR CLASSIFICAÇÃO
// ======================================

async function filtrarPorTipo(tipo) {

    const novaSolicitacao = ++solicitacaoFiltro;

    // Clicar novamente no tipo selecionado remove o filtro.
    if (tipoAtual === tipo) {

        tipoAtual = null;
        digimonsDoTipo = [];

        atualizarBotoesTipos();

        aplicarPesquisa();

        return;
    }

    tipoAtual = tipo;
    digimonsDoTipo = [];

    paginaAtual = 1;

    atualizarBotoesTipos();

    grid.innerHTML = `
        <div class="carregando">
            Buscando Digimons da classificação ${tipo}...
            <br><br>
            Aguarde um momento.
        </div>
    `;

    const resultados = [];

    let indice = 0;
    let carregados = 0;

    const total = todosDigimons.length;

    async function trabalhador() {

        while (indice < total) {

            const posicao = indice++;

            const digimon = todosDigimons[posicao];

            try {

                const tipos = await obterTipos(digimon);

                if (tipos.includes(normalizarTipo(tipo))) {
                    resultados.push(digimon);
                }

            } catch (erro) {

                console.warn(
                    "Erro ao consultar:",
                    digimon.name,
                    erro
                );
            }

            carregados++;

            if (
                carregados % 40 === 0 ||
                carregados === total
            ) {

                if (novaSolicitacao === solicitacaoFiltro) {

                    grid.innerHTML = `
                        <div class="carregando">
                            Procurando Digimons ${tipo}...
                            <br><br>
                            ${carregados} de ${total} consultados
                        </div>
                    `;
                }
            }
        }
    }

    try {

        // Limita as consultas simultâneas para evitar
        // sobrecarregar a API.
        await Promise.all(
            Array.from(
                { length: 5 },
                () => trabalhador()
            )
        );

        if (novaSolicitacao !== solicitacaoFiltro) {
            return;
        }

        digimonsDoTipo = resultados;

        aplicarPesquisa();

        console.log(
            `Digimons da classificação ${tipo}:`,
            resultados.length
        );

    } catch (erro) {

        console.error(erro);

        if (novaSolicitacao === solicitacaoFiltro) {

            grid.innerHTML = `
                <div class="erro">
                    <h3>Não foi possível filtrar os Digimons.</h3>
                    <p>Tente novamente.</p>
                </div>
            `;
        }
    }
}


// ======================================
// ATUALIZAR BOTÕES DE CLASSIFICAÇÃO
// ======================================

function atualizarBotoesTipos() {

    const botoes = document.querySelectorAll(".tipo-btn");

    botoes.forEach(function(botao) {

        const tipo = botao.getAttribute("data-tipo");

        const selecionado = tipo === tipoAtual;

        botao.classList.toggle(
            "tipo-selecionado",
            selecionado
        );

        botao.setAttribute(
            "aria-pressed",
            selecionado
        );
    });
}


// ======================================
// PESQUISA E FILTROS
// ======================================

function aplicarPesquisa() {

    const base = tipoAtual
        ? digimonsDoTipo
        : todosDigimons;

    digimonsFiltrados = base.filter(function(digimon) {

        return digimon.name
            .toLowerCase()
            .includes(textoPesquisa);
    });

    paginaAtual = 1;

    mostrarPagina();
}


// ======================================
// PESQUISAR POR NOME
// ======================================

pesquisa.addEventListener("input", function() {

    textoPesquisa = pesquisa.value
        .toLowerCase()
        .trim();

    aplicarPesquisa();
});


// ======================================
// EVENTOS DOS BOTÕES DE TIPO
// ======================================

document.querySelectorAll(".tipo-btn").forEach(function(botao) {

    botao.addEventListener("click", function() {

        const tipo = botao.getAttribute("data-tipo");

        filtrarPorTipo(tipo);
    });
});


// ======================================
// INICIAR SITE
// ======================================

carregarDigimons();
