const API_URL = "https://digi-api.com/api/v1/digimon";

const grid = document.getElementById("digimonGrid");
const pesquisa = document.getElementById("pesquisa");

const DIGIMONS_POR_PAGINA = 100;

let todosDigimons = [];
let paginaAtual = 1;
let totalPaginas = 1;


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

            console.log(
                "Página carregada:",
                pagina
            );

            if (!dados.content) {
                break;
            }

            todosDigimons.push(
                ...dados.content
            );

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

        totalPaginas = Math.ceil(
            todosDigimons.length /
            DIGIMONS_POR_PAGINA
        );

        console.log(
            "TOTAL DE DIGIMONS:",
            todosDigimons.length
        );

        console.log(
            "TOTAL DE PÁGINAS:",
            totalPaginas
        );

        mostrarPagina();

    } catch (erro) {

        console.error(erro);

        grid.innerHTML = `
            <div class="erro">

                <h3>
                    Erro ao carregar os Digimons
                </h3>

                <p>
                    Verifique sua conexão com a internet.
                </p>

            </div>
        `;
    }
}


function mostrarPagina() {

    const inicio =
        (paginaAtual - 1) *
        DIGIMONS_POR_PAGINA;

    const fim =
        inicio +
        DIGIMONS_POR_PAGINA;

    const digimonsDaPagina =
        todosDigimons.slice(
            inicio,
            fim
        );

    mostrarDigimons(
        digimonsDaPagina
    );

    mostrarPaginacao();
}


function mostrarDigimons(digimons) {

    grid.innerHTML = "";

    if (digimons.length === 0) {

        grid.innerHTML = `
            <div class="erro">
                Nenhum Digimon encontrado.
            </div>
        `;

        return;
    }


    digimons.forEach(
        function(digimon) {

            const card =
                document.createElement(
                    "article"
                );

            card.classList.add(
                "digimon-card"
            );


            const numero =
                String(digimon.id)
                    .padStart(3, "0");


            card.innerHTML = `

                <span class="numero">
                    #${numero}
                </span>

                <img
                    src="${digimon.image}"
                    alt="${digimon.name}"
                >

                <div class="digimon-info">

                    <h3>
                        ${digimon.name}
                    </h3>

                    <button
                        class="info-btn"
                        data-nome="${digimon.name}"
                    >
                        Ver informações
                    </button>

                </div>

            `;


            grid.appendChild(card);

        }
    );


    adicionarEventosBotoes();
}


function mostrarPaginacao() {

    let paginacao =
        document.getElementById(
            "paginacao"
        );


    if (!paginacao) {

        paginacao =
            document.createElement(
                "div"
            );

        paginacao.id =
            "paginacao";


        grid.parentNode.insertBefore(
            paginacao,
            grid.nextSibling
        );
    }


    paginacao.innerHTML = "";


    // ANTERIOR

    const anterior =
        document.createElement(
            "button"
        );

    anterior.textContent =
        "← Anterior";

    anterior.disabled =
        paginaAtual === 1;


    anterior.onclick =
        function() {

            if (paginaAtual > 1) {

                paginaAtual--;

                mostrarPagina();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        };


    paginacao.appendChild(
        anterior
    );


    // NÚMEROS

    for (
        let i = 1;
        i <= totalPaginas;
        i++
    ) {

        const botao =
            document.createElement(
                "button"
            );

        botao.textContent = i;


        if (i === paginaAtual) {

            botao.classList.add(
                "pagina-atual"
            );
        }


        botao.onclick =
            function() {

                paginaAtual = i;

                mostrarPagina();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            };


        paginacao.appendChild(
            botao
        );
    }


    // PRÓXIMA

    const proximo =
        document.createElement(
            "button"
        );

    proximo.textContent =
        "Próxima →";


    proximo.disabled =
        paginaAtual === totalPaginas;


    proximo.onclick =
        function() {

            if (
                paginaAtual <
                totalPaginas
            ) {

                paginaAtual++;

                mostrarPagina();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        };


    paginacao.appendChild(
        proximo
    );
}


function adicionarEventosBotoes() {

    const botoes =
        document.querySelectorAll(
            ".info-btn"
        );


    botoes.forEach(
        function(botao) {

            botao.onclick =
                function() {

                    const nome =
                        botao.getAttribute(
                            "data-nome"
                        );


                    window.location.href =
                        "personagem.html?nome=" +
                        encodeURIComponent(
                            nome
                        );
                };
        }
    );
}


pesquisa.addEventListener(
    "input",
    function() {

        const texto =
            pesquisa.value
                .toLowerCase()
                .trim();


        const resultado =
            todosDigimons.filter(
                function(digimon) {

                    return digimon.name
                        .toLowerCase()
                        .includes(texto);
                }
            );


        mostrarDigimons(
            resultado
        );


        const paginacao =
            document.getElementById(
                "paginacao"
            );

        if (paginacao) {
            paginacao.style.display =
                "none";
        }
    }
);


carregarDigimons();