//Dark mode Funcionalidade
var checkbox = document.querySelector('input[name=theme]');
checkbox.addEventListener('change', function () {
  if (this.checked) {
    trans()
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    trans()
    document.documentElement.setAttribute('data-theme', 'light')
  }
})

let trans = () => {
  document.documentElement.classList.add('transition');
  window.setTimeout(() => {
    document.documentElement.classList.remove('transition')
  }, 1000)
}


//Funcionalidade do Modal
const Modal = {
  open() {
    //Abrir modal
    //Adicionar classe 'active' ao modal
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    //Fechar modal
    //Retirar classe 'active' do modal
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
  },

  set(transaction) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transaction))

  }
};

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    let income = 0;
    /*Check Transação > 0 então somar a variavel */
    Transaction.all.forEach(transactions => {
      if (transactions.amount > 0) {
        income += transactions.amount;
      }
    })
    return income;
  },
  expenses() {
    let expense = 0;
    /*Check Transação < 0 então somar as variavel */
    Transaction.all.forEach(transactions => {
      if (transactions.amount < 0) {
        expense += transactions.amount;
      }
    })
    return expense;
  },
  total() {
    //Entradas - Saidas
    return Transaction.incomes() + Transaction.expenses();
  },
};

// Criando o molde de Criação TD para o HTML
const DOM = {
  //Achando o elemento principal e recebendo TR TD
  transactionsContainer: document.querySelector('#data-table tbody'),

  //Criando um TR para envolver o TD criado abaixo
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    //Passando o TR com o TD para o corpo principal
    DOM.transactionsContainer.appendChild(tr)
  },
  // Molde de TD para cada transação
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="empresa">${transaction.empresa}</td>
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="Remover Transação" />
      </td>
      `
    return html
  },
  /*Fazendo aparecer nos Card*/
  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ""
  }
};

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100

    return value
  },

  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "")

    value = Number(value) / 100

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value

  }
};


/*Execução*/

const Form = {
  empresa: document.querySelector('input#empresa'),
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      empresa: Form.empresa.value,
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()

    if (description.trim() === " " ||
      amount.trim() === " " ||
      date.trim() === "") {
      throw new Error("Por favor, Preencha todos os campos")
    }
  },

  formatValues() {
    let { empresa, description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      empresa,
      description,
      amount,
      date
    }
  },

  saveTransaction(transaction) {
    Transaction.add(transaction)
  },

  clearFields() {
    Form.empresa.value = ""
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      /*validar campos */
      Form.validateFields()
      /*Formatar para salvar */
      const transaction = Form.formatValues()
      /*Salvar A transação */
      Form.saveTransaction(transaction)
      /*Apagar Os dados do Formulario */
      Form.clearFields()
      /*Fechar o Modal */
      Modal.close()

    } catch (error) {
      alert(error.message)
    }

  },
};


const App = {
  init() {

    Transaction.all.forEach(DOM.addTransaction)

    DOM.updateBalance()

    Storage.set(Transaction.all)

  },
  reload() {
    DOM.clearTransactions()
    App.init()
  },
};

App.init()

