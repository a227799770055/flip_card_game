const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}


// Viewer 
const view = {
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `<p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>`

  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCard(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCard(...cards) {
    cards.map(card => {
      card.classList.add("paired")
    })
  },

  renderscore(Score) {
    document.querySelector(".score").innerHTML = `Score : ${Score}`
  },

  renderTriedTime(times) {
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add("wrong")
      card.addEventListener('animationend', event => {
        event.target.classList.remove('wrong'), { once: true }
      })
    })
  },

  showGameFinish() {
    const div = document.createElement('div')
    div.classList.add("completed")
    div.innerHTML =
      `<p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>`
    const header = document.querySelector('#header')
    header.before(div)
  }
}

// Controller
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCard(card)
        model.revelsCards.push(card)
        // 判斷程式是否配對成功
        this.currentState = GAME_STATE.SecondCardAwaits
        console.log(model.score)
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTime(++model.triedTimes)
        view.flipCard(card)
        model.revelsCards.push(card)
        if (model.isRevealedCardsMatched()) { //配對成功

          view.renderscore(model.score += 10)
          this.currentState = GAME_STATE.FirstCardAwaits
          view.pairCard(...model.revelsCards)
          model.revelsCards = []
          if (model.score === 260) {
            // 完成遊戲
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinish()

          }
        } else { //配對失敗
          this.currentState = GAME_STATE.FirstCardAwaits
          view.appendWrongAnimation(...model.revelsCards)
          setTimeout(controller.resetCards, 1000)
        }
        break


    }

  },

  resetCards() {
    view.flipCard(...model.revelsCards)
    model.revelsCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }

}

// Model
const model = {
  revelsCards: [],
  isRevealedCardsMatched() {
    a = this.revelsCards[0].dataset.index % 13;
    b = this.revelsCards[1].dataset.index % 13;
    return a === b
  },
  score: 0,
  triedTimes: 0,
}

//  utility
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}




controller.generateCards()

// EventListener
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})