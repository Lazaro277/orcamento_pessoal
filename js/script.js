class Despesa {
  constructor(ano, mes, dia, tipo, descricao, valor) {
    this.ano = ano;
    this.mes = mes;
    this.dia = dia;
    this.tipo = tipo;
    this.descricao = descricao;
    this.valor = valor;
  }

  validarDados() {
    let verific = 0;
    for (let i in this) { //pecorre os elemento e verifica se é válidos
      if (this[i] == undefined || this[i] == "" || this[i] == null) {
        document.getElementById(i).classList.remove("is-valid");
        document.getElementById(i).classList.add("is-invalid");
        verific = false;
      } else {
        document.getElementById(i).classList.remove("is-invalid");
        document.getElementById(i).classList.add("is-valid");
        verific += 1; //se for válido, a variável verific recebe + 1, e no final se o valor dela for igual a 6, significa que todos os campos são válidos
      }
      if (this.dia > 31) { //verifica se dia é válido
        document.getElementById('dia').classList.add("is-invalid");
        verific = false;
      }
      if (verific === 6) { //verifica se todos os campos são válidos
        return true
      }
    }
  }
}

class Bd {
  constructor() {
    let id = localStorage.getItem("id");

    if (id === null) {
      localStorage.setItem("id", 0);
    }
  }

  getProximoId() {
    let proximoId = localStorage.getItem("id");
    return parseInt(proximoId) + 1;
  }

  gravar(d) {
    let id = this.getProximoId();
    localStorage.setItem(id, JSON.stringify(d));
    localStorage.setItem("id", id);
  }
  recuperarTodosRegistros() {
    //array despesas
    let despesas = Array();
    let id = localStorage.getItem("id");

    //recupera todas as despesas cadastradas em locaStorage
    for (let i = 1; i <= id; i++) {
      //recupera a despesa
      let despesa = JSON.parse(localStorage.getItem(i));

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
      despesasFiltradas = despesasFiltradas.filter(d => d.descricao == despesa.descricao)
    }

    if (despesa.valor != '') {
      despesasFiltradas = despesasFiltradas.filter(d => d.valor == despesa.valor)
    }

    return despesasFiltradas
  }

  remover(id) {
    localStorage.removeItem(id)
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

function carregaListaDespesas(despesas = Array(), filtro = false) {
  if (despesas.length == 0 && filtro == false) {
    despesas = bd.recuperarTodosRegistros();
  }

  // Verifica se uma despesa foi removida para mostrar o modal de sucesso
  if (localStorage.getItem('despesaRemovida') === 'true') {
    let modal = new Modal(
      "Despesa removida",
      "success",
      "Sua despesa foi removida com sucesso!",
      "Ok"
    );
    modal.mostrarModal();
    localStorage.removeItem('despesaRemovida'); // Limpa o indicador
  }
  //seleciona o elemento tbody da tabela
  let listaDespesas = document.getElementById("listaDespesas");
  if (despesas.length == 0 && filtro == true) {
    listaDespesas.innerHTML = 'Nenhum item encontrado'
  } else {
    listaDespesas.innerHTML = ''
  }

  //pecorre o array despesas e lista cada dispesa de forma dinâmica
  despesas.forEach(function (d) {
    //criação das linhas na tabela
    let linha = listaDespesas.insertRow();

    //criação das colunas
    linha.insertCell(0).innerHTML = `${d.dia}/${d.mes}/${d.ano}`;
    //ajustando o tipo
    switch (d.tipo) {
      case "1":
        d.tipo = "Alimentação";
        break;
      case "2":
        d.tipo = "Educação";
        break;
      case "3":
        d.tipo = "Lazer";
        break;
      case "4":
        d.tipo = "Saúde";
        break;
      case "5":
        d.tipo = "Transporte";
        break;
    }
    linha.insertCell(1).innerHTML = d.tipo;
    linha.insertCell(2).innerHTML = d.descricao;
    linha.insertCell(3).innerHTML = d.valor;
    //botão de exclusão
    let btn = document.createElement('button')
    btn.className = 'btn btn-exclusao btn-danger'
    btn.innerHTML = '<i class="fas fa-times"></i>'
    btn.id = `id_despesa_${d.id}`
    linha.insertCell(4).append(btn)
    btn.onclick = function() {
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

  document.getElementById('btnModal').onclick = function() {
    const idParaRemover = this.getAttribute('data-expense-id');
    if (idParaRemover) {
      bd.remover(idParaRemover);
      localStorage.setItem('despesaRemovida', 'true'); // Define o indicador
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
  let despesas = bd.pesquisar(despesa)

  carregaListaDespesas(despesas, true)
}