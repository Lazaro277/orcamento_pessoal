class Despesa {
  constructor(ano, mes, dia, tipo, descricao, valor) {
    this.ano = ano;
    this.mes = mes;
    this.dia = dia;
    this.tipo = tipo;
    this.descricao = descricao.trim();
    this.valor = valor.replace(",", ".");
  }

  validarDados() {
    let valido = true;

    // Verifica se todos os campos foram preenchidos
    for (let i in this) {
      const campo = document.getElementById(i);

      if (this[i] === undefined || this[i] === "" || this[i] === null) {
        campo.classList.remove("is-valid");
        campo.classList.add("is-invalid");
        valido = false;
      } else {
        campo.classList.remove("is-invalid");
        campo.classList.add("is-valid");
      }
    }

    // Verifica se a data realmente existe
    const data = new Date(
      Number(this.ano),
      Number(this.mes) - 1,
      Number(this.dia)
    );

    const dataValida =
      data.getFullYear() === Number(this.ano) &&
      data.getMonth() === Number(this.mes) - 1 &&
      data.getDate() === Number(this.dia);

    const campoDia = document.getElementById("dia");

    if (!dataValida) {
      campoDia.classList.remove("is-valid");
      campoDia.classList.add("is-invalid");
      valido = false;
    } else if (this.dia !== "") {
      campoDia.classList.remove("is-invalid");
      campoDia.classList.add("is-valid");
    }

    // Verifica se o valor é um número maior que zero
    const valorNumerico = Number(this.valor);

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      document.getElementById("valor").classList.remove("is-valid");
      document.getElementById("valor").classList.add("is-invalid");
      valido = false;
    }

    return valido;
  }
}

class Bd {
  constructor() {
    let id = localStorage.getItem("orcamento_pessoal_id");

    if (id === null) {
      localStorage.setItem("orcamento_pessoal_id", 0);
    }
  }

  getProximoId() {
    let proximoId = localStorage.getItem("orcamento_pessoal_id");
    return parseInt(proximoId) + 1;
  }

  gravar(d) {
    let id = this.getProximoId();
    localStorage.setItem(
      `orcamento_pessoal_despesa_${id}`,
      JSON.stringify(d)
    );
    localStorage.setItem("orcamento_pessoal_id", id);
  }
  recuperarTodosRegistros() {
    //array despesas
    let despesas = Array();
    let id = localStorage.getItem("orcamento_pessoal_id");

    //recupera todas as despesas cadastradas em locaStorage
    for (let i = 1; i <= id; i++) {
      //recupera a despesa
      let despesa = JSON.parse(
        localStorage.getItem(`orcamento_pessoal_despesa_${i}`)
      );

      if (despesa === null) {
        continue;
      }
      despesa.id = i
      despesas.push(despesa);
    }
    return despesas;
  }

  pesquisar(despesa) {
    let despesasFiltradas = Array()
    despesasFiltradas = this.recuperarTodosRegistros()

    if (despesa.ano != '') {
      despesasFiltradas = despesasFiltradas.filter(d => d.ano == despesa.ano)
    }

    if (despesa.mes != '') {
      despesasFiltradas = despesasFiltradas.filter(d => d.mes == despesa.mes)
    }

    if (despesa.dia != '') {
      despesasFiltradas = despesasFiltradas.filter(d => d.dia == despesa.dia)
    }

    if (despesa.tipo != '') {
      despesasFiltradas = despesasFiltradas.filter(d => d.tipo == despesa.tipo)
    }

    if (despesa.descricao != '') {
      despesasFiltradas = despesasFiltradas.filter(d =>
        d.descricao.toLowerCase().includes(despesa.descricao.toLowerCase())
      )
    }

    if (despesa.valor != '') {
      despesasFiltradas = despesasFiltradas.filter(d => d.valor == despesa.valor)
    }

    return despesasFiltradas
  }

  remover(id) {
    localStorage.removeItem(`orcamento_pessoal_despesa_${id}`);
  }
}

let bd = new Bd();

class Modal {
  constructor(title, cor, body, btn) {
    this.title = title;
    this.cor = cor;
    this.body = body;
    this.btn = btn;
  }

  mostrarModal() {
    document.getElementById("titleModal").innerHTML = this.title;
    document.getElementById("titleModal").className =
      "modal-title fs-5 text-" + this.cor;
    document.getElementById("bodyModal").innerHTML = this.body;
    document.getElementById("btnModal").innerHTML = this.btn;
    document.getElementById("btnModal").className = "btn btn-" + this.cor;
    document.getElementById("btnModal").removeAttribute("data-expense-id");

    const modal = new bootstrap.Modal(
      document.getElementById("modalRegistraDespesa")
    );
    modal.show();
  }
}

function cadastrarDespesa() {
  let ano = document.getElementById("ano");
  let mes = document.getElementById("mes");
  let dia = document.getElementById("dia");
  let tipo = document.getElementById("tipo");
  let descricao = document.getElementById("descricao");
  let valor = document.getElementById("valor");

  let despesa = new Despesa(
    ano.value,
    mes.value,
    dia.value,
    tipo.value,
    descricao.value,
    valor.value
  );


  if (despesa.validarDados()) {
    bd.gravar(despesa);
    carregaDespesasRecentes();
    let modal = new Modal(
      "Registro inserido com sucesso",
      "success",
      "Despesa foi cadastrada com sucesso!",
      "Voltar"
    );
    ano.value = ""; ano.classList.remove("is-valid");
    mes.value = ""; mes.classList.remove("is-valid");
    dia.value = ""; dia.classList.remove("is-valid");
    tipo.value = ""; tipo.classList.remove("is-valid");
    descricao.value = ""; descricao.classList.remove("is-valid");
    valor.value = ""; valor.classList.remove("is-valid");
    modal.mostrarModal();
  } else {
    let modal = new Modal(
      "Existem campos inválidos",
      "danger",
      "Verifique se todos os campos foram preenchidos corretamente!",
      "Voltar e corrigir"
    );
    modal.mostrarModal();
  }
}

function obterNomeTipo(tipo) {
  switch (tipo) {
    case "1":
      return "Alimentação";
    case "2":
      return "Educação";
    case "3":
      return "Lazer";
    case "4":
      return "Saúde";
    case "5":
      return "Transporte";
    default:
      return "Não informado";
  }
}

function carregaListaDespesas(despesas = Array(), filtro = false) {
  if (despesas.length == 0 && filtro == false) {
    despesas = bd.recuperarTodosRegistros().reverse();
  }

  // Verifica se uma despesa foi removida para mostrar o modal de sucesso
  if (localStorage.getItem('orcamento_pessoal_despesa_removida') === 'true') {
    let modal = new Modal(
      "Despesa removida",
      "success",
      "Sua despesa foi removida com sucesso!",
      "Ok"
    );
    modal.mostrarModal();
    localStorage.removeItem('orcamento_pessoal_despesa_removida'); // Limpa o indicador
  }
  //seleciona o elemento tbody da tabela
  let listaDespesas = document.getElementById("listaDespesas");
  if (despesas.length === 0) {
    listaDespesas.innerHTML = `
    <tr>
      <td colspan="5" class="text-center text-muted py-4">
        Nenhuma despesa encontrada
      </td>
    </tr>
  `;
  } else {
    listaDespesas.innerHTML = "";
  }

  //pecorre o array despesas e lista cada dispesa de forma dinâmica
  despesas.forEach(function (d) {
    //criação das linhas na tabela
    let linha = listaDespesas.insertRow();

    //criação das colunas
    linha.insertCell(0).innerHTML = `${d.dia}/${d.mes}/${d.ano}`;

    linha.insertCell(1).textContent = obterNomeTipo(d.tipo);
    linha.insertCell(2).textContent = d.descricao;
    linha.insertCell(3).innerHTML = formatarValor(d.valor);
    //botão de exclusão
    let btn = document.createElement('button')
    btn.className = 'btn btn-exclusao btn-danger'
    btn.innerHTML = '<i class="fas fa-times"></i>'
    btn.id = `id_despesa_${d.id}`
    btn.setAttribute("aria-label", "Excluir despesa");
    linha.insertCell(4).append(btn)
    btn.onclick = function () {
      const id = this.id.replace('id_despesa_', '')

      let modal = new Modal(
        "Exclusão de despesa",
        "danger",
        "Você tem certeza que deseja excluir essa despesa?",
        "Sim, quero excluir"
      );
      modal.mostrarModal();

      let btnModal = document.getElementById('btnModal');
      // Armazena o ID no próprio botão do modal para referência
      btnModal.setAttribute('data-expense-id', id);
    }
  });

  document.getElementById('btnModal').onclick = function () {
    const idParaRemover = this.getAttribute('data-expense-id');
    if (idParaRemover) {
      bd.remover(idParaRemover);
      localStorage.setItem('orcamento_pessoal_despesa_removida', 'true'); // Define o indicador
      window.location.reload();
    }
  }
}

function pesquisarDespesas() {
  let ano = document.getElementById("ano").value;
  let mes = document.getElementById("mes").value;
  let dia = document.getElementById("dia").value;
  let tipo = document.getElementById("tipo").value;
  let descricao = document.getElementById("descricao").value;
  let valor = document.getElementById("valor").value;

  let despesa = new Despesa(ano, mes, dia, tipo, descricao, valor)
  let despesas = bd.pesquisar(despesa).reverse()

  carregaListaDespesas(despesas, true)
}

if (document.getElementById("listaDespesas")) {
  carregaListaDespesas();
}

function carregaDespesasRecentes() {
  const listaDespesas = document.getElementById("listaDespesasRecentes");

  // A função só continua se estivermos na página inicial
  if (!listaDespesas) {
    return;
  }

  listaDespesas.innerHTML = "";

  const despesas = bd.recuperarTodosRegistros().reverse().slice(0, 5);

  if (despesas.length === 0) {
    listaDespesas.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted py-4">
          Nenhuma despesa cadastrada
        </td>
      </tr>
    `;
    return;
  }

  despesas.forEach(function (d) {
    const linha = listaDespesas.insertRow();

    linha.insertCell(0).innerHTML = `${d.dia}/${d.mes}/${d.ano}`;

    linha.insertCell(1).textContent = obterNomeTipo(d.tipo);
    linha.insertCell(2).textContent = d.descricao;
    linha.insertCell(3).innerHTML = formatarValor(d.valor);
  });

}
carregaDespesasRecentes();

function formatarValor(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function carregarAnos() {
  const campoAno = document.getElementById("ano");

  if (!campoAno) {
    return;
  }

  const anoAtual = new Date().getFullYear();

  for (let ano = anoAtual; ano >= 2020; ano--) {
    const option = document.createElement("option");
    option.value = ano;
    option.textContent = ano;
    campoAno.appendChild(option);
  }
}

carregarAnos();