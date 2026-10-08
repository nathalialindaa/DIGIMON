const botaoTema =
    document.getElementById("botaoTema");


function aplicarTema() {

    const tema =
        localStorage.getItem("tema");

    if (tema === "escuro") {

        document.body.classList.add(
            "tema-escuro"
        );

        botaoTema.textContent =
            "☀️ Tema claro";

    } else {

        document.body.classList.remove(
            "tema-escuro"
        );

        botaoTema.textContent =
            "🌙 Tema escuro";
    }
}


botaoTema.addEventListener(
    "click",
    function() {

        const escuro =
            document.body.classList.toggle(
                "tema-escuro"
            );


        if (escuro) {

            localStorage.setItem(
                "tema",
                "escuro"
            );

            botaoTema.textContent =
                "☀️ Tema claro";

        } else {

            localStorage.setItem(
                "tema",
                "claro"
            );

            botaoTema.textContent =
                "🌙 Tema escuro";
        }

    }
);


aplicarTema();