// ===== 1. DADOS (edite aqui para mudar o site) =====
const cortes = [
    { nome: "Corte", desc: "Corte na máquina e tesoura.", preco: 45, duracao: 40 },
    { nome: "Barba", desc: "Barba modelada com toalha quente.", preco: 30, duracao: 20 },
    { nome: "Sobrancelha", desc: "Design e limpeza da sobrancelha.", preco: 15, duracao: 10 },
    { nome: "Combo simples", desc: "Corte + sobrancelha.", preco: 45, duracao: 50 },
    { nome: "Super combo", desc: "Corte + barba + sobrancelha.", preco: 70, duracao: 70 },
];

const barbeiros = ["João", "Carlos", "Pedro", "Lucas", "Rafael"];

// Horários das 9:00 às 19:00, de 30 em 30 minutos
const horarios = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
                  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
                  "18:00", "18:30", "19:00"];

// ===== 2. ELEMENTOS =====
const listaCortes = document.getElementById("lista-cortes");
const form = document.getElementById("form-agendamento");
const selServico = document.getElementById("servico");
const selBarbeiro = document.getElementById("barbeiro");
const inpData = document.getElementById("data");
const selHorario = document.getElementById("horario");
const msg = document.getElementById("mensagem");

// ===== 3. ARMAZENAMENTO (localStorage) =====
function lerAgendamentos() {
    try {
        return JSON.parse(localStorage.getItem("agendamentos")) || [];
    } catch {
        return [];
    }
}

function salvarAgendamento(ag) {
    const todos = lerAgendamentos();
    todos.push(ag);
    localStorage.setItem("agendamentos", JSON.stringify(todos));
}

// ===== 4. CATÁLOGO DE SERVIÇOS =====
cortes.forEach((c, i) => {
    listaCortes.insertAdjacentHTML("beforeend", `
        <article class="card">
            <h3>${c.nome}</h3>
            <p class="desc">${c.desc}</p>
            <span class="preco">R$ ${c.preco}</span>
            <span class="tempo">${c.duracao} min</span>
            <button class="botao" data-indice="${i}">Agendar</button>
        </article>
    `);
    selServico.insertAdjacentHTML("beforeend",
        `<option value="${c.nome}">${c.nome} - R$ ${c.preco}</option>`);
});

barbeiros.forEach(b => {
    selBarbeiro.insertAdjacentHTML("beforeend", `<option value="${b}">${b}</option>`);
});

// Botão "Agendar" do card já escolhe o serviço no formulário
listaCortes.addEventListener("click", e => {
    const botao = e.target.closest("button");
    if (!botao) return;
    selServico.value = cortes[botao.dataset.indice].nome;
    document.getElementById("agendamento").scrollIntoView();
});

// ===== 5. DATA E HORÁRIOS DISPONÍVEIS =====
const hoje = new Date();
inpData.min = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000)
    .toISOString().split("T")[0];

function atualizarHorarios() {
    selHorario.innerHTML = "";
    if (!inpData.value) {
        selHorario.innerHTML = '<option value="">Escolha a data primeiro</option>';
        return;
    }
    const ocupados = lerAgendamentos()
        .filter(a => a.data === inpData.value && a.barbeiro === selBarbeiro.value)
        .map(a => a.horario);

    selHorario.insertAdjacentHTML("beforeend", '<option value="">Escolha o horário</option>');
    horarios.forEach(h => {
        const ocupado = ocupados.includes(h);
        selHorario.insertAdjacentHTML("beforeend",
            `<option value="${h}" ${ocupado ? "disabled" : ""}>${h}${ocupado ? " (ocupado)" : ""}</option>`);
    });
}

inpData.addEventListener("change", atualizarHorarios);
selBarbeiro.addEventListener("change", atualizarHorarios);

// ===== 6. MÁSCARA DO TELEFONE =====
const inpTelefone = document.getElementById("telefone");

inpTelefone.addEventListener("input", () => {
    let n = inpTelefone.value.replace(/\D/g, "").slice(0, 11);

    if (n.length > 10) {
        n = n.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (n.length > 6) {
        n = n.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (n.length > 2) {
        n = n.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    } else if (n.length > 0) {
        n = n.replace(/^(\d{0,2})$/, "($1");
    }

    inpTelefone.value = n;
});

// ===== 7. ENVIO DO FORMULÁRIO =====
function mostrar(texto, tipo) {
    msg.textContent = texto;
    msg.className = tipo;
}

form.addEventListener("submit", e => {
    e.preventDefault();

    const ag = {
        nome: document.getElementById("nome").value.trim(),
        telefone: inpTelefone.value.trim(),
        servico: selServico.value,
        barbeiro: selBarbeiro.value,
        data: inpData.value,
        horario: selHorario.value,
    };

    if (!ag.nome || !ag.telefone || !ag.data || !ag.horario) {
        mostrar("Preencha nome, telefone, data e horário.", "erro");
        return;
    }
    if (ag.telefone.replace(/\D/g, "").length < 10) {
        mostrar("Digite um telefone com DDD.", "erro");
        return;
    }
    if (ag.data < inpData.min) {
        mostrar("Escolha uma data a partir de hoje.", "erro");
        return;
    }

    salvarAgendamento(ag);
    mostrar(`Agendado! ${ag.servico} com ${ag.barbeiro} em ${ag.data.split("-").reverse().join("/")} às ${ag.horario}.`, "ok");
    form.reset();
    atualizarHorarios();
});