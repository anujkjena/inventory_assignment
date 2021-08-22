import { itemInventory } from './countryInventory.js'
import { constants } from './constant.js'

export default class Inventory {

  constructor() {
    this.inputString = ''
    this.maskQuantityRemainingInUK = 0
    this.maskQuantityRemainingInGermany = 0
    this.glovesQuantityRemainingInUK = 0
    this.glovesQuantityRemainingInGermany = 0
  }

  /**
   * Calculate the total sale price according to the available quantity in inventory
   * @param inputString user input string
   * @returns totals sale price with remaining quantity in inventory
   */
  calculatePriceAndInventory(inputString) {
    this.replenishedInventory()
    this.inputString = inputString
    const inputData = this.validateInputString()
    if (inputData.error) {
      return inputData.message
    }
    const checkAvailability = this.checkItemAvailability(inputData.data.firstItemType, inputData.data.firstItemQuantity) && this.checkItemAvailability(inputData.data.secondItemType, inputData.data.secondItemQuantity)
    if(!checkAvailability) {
      return `${constants.outOfStock}:${this.maskQuantityRemainingInUK}:${this.maskQuantityRemainingInGermany}:${this.glovesQuantityRemainingInUK}:${this.glovesQuantityRemainingInGermany}`
    }
    let maskQuantityPickFromUK = 0
    let maskQuantityPickFromGermany = 0
    let glovesQuantityPickFromUK = 0
    let glovesQuantityPickFromGermany = 0
    let price = 0
    const maskQuantity = inputData.data.firstItemType === constants.mask ? inputData.data.firstItemQuantity : inputData.data.secondItemQuantity
    const glovesQuantity = inputData.data.firstItemType === constants.gloves ? inputData.data.firstItemQuantity : inputData.data.secondItemQuantity
    if(inputData.data.country === constants.countryUK) {
      const tempMaskResultUK = this.calculateMaskQuantity(maskQuantity, constants.countryGermany, inputData.data.passportCountry)
      maskQuantityPickFromUK = tempMaskResultUK.maskQuantityPickFromUK
      maskQuantityPickFromGermany = tempMaskResultUK.maskQuantityPickFromGermany
      price += maskQuantityPickFromUK * itemInventory.UK.Mask.price + maskQuantityPickFromGermany * itemInventory.Germany.Mask.price
      price += maskQuantityPickFromGermany === 0 ? 0 : this.calculateShippingCharge(maskQuantityPickFromGermany, constants.countryGermany, inputData.data.passportCountry)
      const tempGlovesResultUK = this.calculateGlovesQuantity(glovesQuantity, constants.countryGermany, inputData.data.passportCountry)
      glovesQuantityPickFromUK = tempGlovesResultUK.glovesQuantityPickFromUK
      glovesQuantityPickFromGermany = tempGlovesResultUK.glovesQuantityPickFromGermany
      price += glovesQuantityPickFromUK * itemInventory.UK.Gloves.price + glovesQuantityPickFromGermany * itemInventory.Germany.Gloves.price
      price += glovesQuantityPickFromGermany === 0 ? 0 : this.calculateShippingCharge(glovesQuantityPickFromGermany, constants.countryGermany, inputData.data.passportCountry)
      return `${price}:${this.maskQuantityRemainingInUK}:${this.maskQuantityRemainingInGermany}:${this.glovesQuantityRemainingInUK}:${this.glovesQuantityRemainingInGermany}`
    } else {
      const tempMaskResultGermany = this.calculateMaskQuantity(maskQuantity, constants.countryUK, inputData.data.passportCountry)
      maskQuantityPickFromUK = tempMaskResultGermany.maskQuantityPickFromUK
      maskQuantityPickFromGermany = tempMaskResultGermany.maskQuantityPickFromGermany
      price += maskQuantityPickFromUK * itemInventory.UK.Mask.price + maskQuantityPickFromGermany * itemInventory.Germany.Mask.price
      price += maskQuantityPickFromUK === 0 ? 0 : this.calculateShippingCharge(maskQuantityPickFromUK, constants.countryUK, inputData.data.passportCountry)
      const tempGlovesResultGermany = this.calculateGlovesQuantity(glovesQuantity, constants.countryUK, inputData.data.passportCountry)
      glovesQuantityPickFromUK = tempGlovesResultGermany.glovesQuantityPickFromUK
      glovesQuantityPickFromGermany = tempGlovesResultGermany.glovesQuantityPickFromGermany
      price += glovesQuantityPickFromUK * itemInventory.UK.Gloves.price + glovesQuantityPickFromGermany * itemInventory.Germany.Gloves.price
      price += glovesQuantityPickFromUK === 0 ? 0 : this.calculateShippingCharge(glovesQuantityPickFromUK, constants.countryUK, inputData.data.passportCountry)
      return `${price}:${this.maskQuantityRemainingInUK}:${this.maskQuantityRemainingInGermany}:${this.glovesQuantityRemainingInUK}:${this.glovesQuantityRemainingInGermany}`
    }
  }

  /**
   * Calculate shipping charges with applicable discount 
   * @param quantity item quantity need to be shipped
   * @param shippingCountry country from item should shipped
   * @param passportCountry user passport origin country
   * @returns shipping charge
   */
  calculateShippingCharge(quantity, shippingCountry, passportCountry) {
    const shippingCharge = passportCountry === 'N/A' || passportCountry !== shippingCountry ? constants.shippingCharge : constants.shippingCharge - ((constants.shippingCharge * constants.localPassportDiscount)/100)
    return shippingCharge * Math.ceil(quantity/10)
  }

  /**
   * Calculate masks quantity picked from UK & Germany
   * @param maskQuantity masks quantity
   * @param shippingCountry country from item to be shipped
   * @param passportCountry origin country of user's passport
   * @returns an object with following keys(maskQuantityPickFromGermany, maskQuantityPickFromUK)
   */
  calculateMaskQuantity(maskQuantity, shippingCountry, passportCountry) {
    const returnObject = {
      maskQuantityPickFromGermany: 0,
      maskQuantityPickFromUK: 0
    }
    const tempRemainderQuantity = maskQuantity % 10
    const tempQuotientQuantity = maskQuantity - tempRemainderQuantity
    let maskSalePriceInUKForReminderQuantity = 0
    let maskSalePriceInUKForQuotientQuantity = 0
    let maskSalePriceInGermanyForReminderQuantity = 0
    let maskSalePriceInGermanyForQuotientQuantity = 0
    if(shippingCountry === constants.countryGermany) {
      maskSalePriceInUKForReminderQuantity = tempRemainderQuantity * itemInventory.UK.Mask.price
      maskSalePriceInUKForQuotientQuantity = tempQuotientQuantity * itemInventory.UK.Mask.price
      maskSalePriceInGermanyForReminderQuantity = tempRemainderQuantity * itemInventory.Germany.Mask.price + this.calculateShippingCharge(tempRemainderQuantity, shippingCountry, passportCountry)
      maskSalePriceInGermanyForQuotientQuantity = tempQuotientQuantity * itemInventory.Germany.Mask.price + this.calculateShippingCharge(tempQuotientQuantity, shippingCountry, passportCountry)
    } else {
      maskSalePriceInUKForReminderQuantity = tempRemainderQuantity * itemInventory.UK.Mask.price + this.calculateShippingCharge(tempRemainderQuantity, shippingCountry, passportCountry)
      maskSalePriceInUKForQuotientQuantity = tempQuotientQuantity * itemInventory.UK.Mask.price + this.calculateShippingCharge(tempQuotientQuantity, shippingCountry, passportCountry)
      maskSalePriceInGermanyForReminderQuantity = tempRemainderQuantity * itemInventory.Germany.Mask.price
      maskSalePriceInGermanyForQuotientQuantity = tempQuotientQuantity * itemInventory.Germany.Mask.price
    }
    if(maskSalePriceInUKForReminderQuantity <= maskSalePriceInGermanyForReminderQuantity) {
      if( tempRemainderQuantity >= this.maskQuantityRemainingInUK) {
        returnObject.maskQuantityPickFromUK += this.maskQuantityRemainingInUK
        returnObject.maskQuantityPickFromGermany += tempRemainderQuantity === this.maskQuantityRemainingInUK ? 0 :  tempRemainderQuantity - this.maskQuantityRemainingInUK
        this.maskQuantityRemainingInGermany = this.maskQuantityRemainingInGermany - (tempRemainderQuantity - this.maskQuantityRemainingInUK)
        this.maskQuantityRemainingInUK = 0
      } else {
        returnObject.maskQuantityPickFromUK += tempRemainderQuantity
        this.maskQuantityRemainingInUK = this.maskQuantityRemainingInUK - tempRemainderQuantity
        returnObject.maskQuantityPickFromGermany += 0
      }
    } else {
      if( tempRemainderQuantity >= this.maskQuantityRemainingInGermany) {
        returnObject.maskQuantityPickFromGermany += this.maskQuantityRemainingInGermany
        returnObject.maskQuantityPickFromUK += tempRemainderQuantity === this.maskQuantityRemainingInGermany ? 0 :  tempRemainderQuantity - this.maskQuantityRemainingInGermany
        this.maskQuantityRemainingInUK = this.maskQuantityRemainingInUK - (tempRemainderQuantity - this.maskQuantityRemainingInGermany)
        this.maskQuantityRemainingInGermany = 0
      } else {
        returnObject.maskQuantityPickFromGermany += tempRemainderQuantity
        this.maskQuantityRemainingInGermany = this.maskQuantityRemainingInGermany - tempRemainderQuantity
        returnObject.maskQuantityPickFromUK += 0
      }
    }
    if(maskSalePriceInUKForQuotientQuantity <= maskSalePriceInGermanyForQuotientQuantity) {
      if( tempQuotientQuantity >= this.maskQuantityRemainingInUK) {
        returnObject.maskQuantityPickFromUK += this.maskQuantityRemainingInUK
        returnObject.maskQuantityPickFromGermany += tempQuotientQuantity === this.maskQuantityRemainingInUK ? 0 :  tempQuotientQuantity - this.maskQuantityRemainingInUK
        this.maskQuantityRemainingInGermany = this.maskQuantityRemainingInGermany - (tempQuotientQuantity - this.maskQuantityRemainingInUK)
        this.maskQuantityRemainingInUK = 0
      } else {
        returnObject.maskQuantityPickFromUK += tempQuotientQuantity
        this.maskQuantityRemainingInUK = this.maskQuantityRemainingInUK - tempQuotientQuantity
        returnObject.maskQuantityPickFromGermany += 0
      }
    } else {
      if( tempQuotientQuantity >= this.maskQuantityRemainingInGermany) {
        returnObject.maskQuantityPickFromGermany += this.maskQuantityRemainingInGermany
        returnObject.maskQuantityPickFromUK += tempQuotientQuantity === this.maskQuantityRemainingInGermany ? 0 :  tempQuotientQuantity - this.maskQuantityRemainingInGermany
        this.maskQuantityRemainingInUK = this.maskQuantityRemainingInUK - (tempQuotientQuantity - this.maskQuantityRemainingInGermany)
        this.maskQuantityRemainingInGermany = 0
      } else {
        returnObject.maskQuantityPickFromGermany += tempQuotientQuantity
        this.maskQuantityRemainingInGermany = this.maskQuantityRemainingInGermany - tempQuotientQuantity
        returnObject.maskQuantityPickFromUK += 0
      }
    }
    return returnObject
  }

  /**
   * Calculate gloves quantity picked from UK & Germany
   * @param glovesQuantity gloves quantity
   * @param shippingCountry country from item to be shipped
   * @param passportCountry origin country of user's passport
   * @returns an object with following keys(glovesQuantityPickFromGermany, glovesQuantityPickFromUK)
   */
  calculateGlovesQuantity(glovesQuantity, shippingCountry, passportCountry) {
    const returnObject = {
      glovesQuantityPickFromGermany: 0,
      glovesQuantityPickFromUK: 0
    }
    const tempRemainderQuantity = glovesQuantity % 10
    const tempQuotientQuantity = glovesQuantity - tempRemainderQuantity
    let glovesSalePriceInUKForReminderQuantity = 0
    let glovesSalePriceInUKForQuotientQuantity = 0
    let glovesSalePriceInGermanyForReminderQuantity = 0
    let glovesSalePriceInGermanyForQuotientQuantity = 0
    if(shippingCountry === constants.countryGermany) {
      glovesSalePriceInUKForReminderQuantity = tempRemainderQuantity * itemInventory.UK.Gloves.price
      glovesSalePriceInUKForQuotientQuantity = tempQuotientQuantity * itemInventory.UK.Gloves.price
      glovesSalePriceInGermanyForReminderQuantity = tempRemainderQuantity * itemInventory.Germany.Gloves.price + this.calculateShippingCharge(tempRemainderQuantity, shippingCountry, passportCountry)
      glovesSalePriceInGermanyForQuotientQuantity = tempQuotientQuantity * itemInventory.Germany.Gloves.price + this.calculateShippingCharge(tempQuotientQuantity, shippingCountry, passportCountry)
    } else {
      glovesSalePriceInUKForReminderQuantity = tempRemainderQuantity * itemInventory.UK.Gloves.price + this.calculateShippingCharge(tempRemainderQuantity, shippingCountry, passportCountry)
      glovesSalePriceInUKForQuotientQuantity = tempQuotientQuantity * itemInventory.UK.Gloves.price + this.calculateShippingCharge(tempQuotientQuantity, shippingCountry, passportCountry)
      glovesSalePriceInGermanyForReminderQuantity = tempRemainderQuantity * itemInventory.Germany.Gloves.price
      glovesSalePriceInGermanyForQuotientQuantity = tempQuotientQuantity * itemInventory.Germany.Gloves.price
    }
    if(glovesSalePriceInUKForReminderQuantity <= glovesSalePriceInGermanyForReminderQuantity) {
      if( tempRemainderQuantity >= this.glovesQuantityRemainingInUK) {
        returnObject.glovesQuantityPickFromUK += this.glovesQuantityRemainingInUK
        returnObject.glovesQuantityPickFromGermany += tempRemainderQuantity === this.glovesQuantityRemainingInUK ? 0 :  tempRemainderQuantity - this.glovesQuantityRemainingInUK
        this.glovesQuantityRemainingInGermany = this.glovesQuantityRemainingInGermany - (tempRemainderQuantity - this.glovesQuantityRemainingInUK)
        this.glovesQuantityRemainingInUK = 0
      } else {
        returnObject.glovesQuantityPickFromUK += tempRemainderQuantity
        this.glovesQuantityRemainingInUK = this.glovesQuantityRemainingInUK - tempRemainderQuantity
        returnObject.glovesQuantityPickFromGermany += 0
      }
    } else {
      if( tempRemainderQuantity >= this.glovesQuantityRemainingInGermany) {
        returnObject.glovesQuantityPickFromGermany += this.glovesQuantityRemainingInGermany
        returnObject.glovesQuantityPickFromUK += tempRemainderQuantity === this.glovesQuantityRemainingInGermany ? 0 :  tempRemainderQuantity - this.glovesQuantityRemainingInGermany
        this.glovesQuantityRemainingInUK = this.glovesQuantityRemainingInUK - (tempRemainderQuantity - this.glovesQuantityRemainingInGermany)
        this.glovesQuantityRemainingInGermany = 0
      } else {
        returnObject.glovesQuantityPickFromGermany += tempRemainderQuantity
        this.glovesQuantityRemainingInGermany = this.glovesQuantityRemainingInGermany - tempRemainderQuantity
        returnObject.glovesQuantityPickFromUK += 0
      }
    }
    if(glovesSalePriceInUKForQuotientQuantity <= glovesSalePriceInGermanyForQuotientQuantity) {
      if( tempQuotientQuantity >= this.glovesQuantityRemainingInUK) {
        returnObject.glovesQuantityPickFromUK += this.glovesQuantityRemainingInUK
        returnObject.glovesQuantityPickFromGermany += tempQuotientQuantity === this.glovesQuantityRemainingInUK ? 0 :  tempQuotientQuantity - this.glovesQuantityRemainingInUK
        this.glovesQuantityRemainingInGermany = this.glovesQuantityRemainingInGermany - (tempQuotientQuantity - this.glovesQuantityRemainingInUK)
        this.glovesQuantityRemainingInUK = 0
      } else {
        returnObject.glovesQuantityPickFromUK += tempQuotientQuantity
        this.glovesQuantityRemainingInUK = this.glovesQuantityRemainingInUK - tempQuotientQuantity
        returnObject.glovesQuantityPickFromGermany += 0
      }
    } else {
      if( tempQuotientQuantity >= this.glovesQuantityRemainingInGermany) {
        returnObject.glovesQuantityPickFromGermany += this.glovesQuantityRemainingInGermany
        returnObject.glovesQuantityPickFromUK += tempQuotientQuantity === this.glovesQuantityRemainingInGermany ? 0 :  tempQuotientQuantity - this.glovesQuantityRemainingInGermany
        this.glovesQuantityRemainingInUK = this.glovesQuantityRemainingInUK - (tempQuotientQuantity - this.glovesQuantityRemainingInUK)
        this.glovesQuantityRemainingInGermany = 0
      } else {
        returnObject.glovesQuantityPickFromGermany += tempQuotientQuantity
        this.glovesQuantityRemainingInGermany = this.glovesQuantityRemainingInGermany - tempQuotientQuantity
        returnObject.glovesQuantityPickFromUK += 0
      }
    }
    return returnObject
  }


  /**
   * Check items availability
   * @param item item type
   * @param quantity required quantity
   * @returns item availability true | false
   */
  checkItemAvailability(item, quantity) {
    if(item === constants.mask) {
      return this.maskQuantityRemainingInUK + this.maskQuantityRemainingInGermany >= quantity ? true : false
    }
    return this.glovesQuantityRemainingInUK + this.glovesQuantityRemainingInGermany >= quantity ? true : false
  }

  /**
   * Reset Inventory
   */
  replenishedInventory() {
    this.maskQuantityRemainingInUK = itemInventory.UK.Mask.quantity
    this.maskQuantityRemainingInGermany = itemInventory.Germany.Mask.quantity
    this.glovesQuantityRemainingInUK = itemInventory.UK.Gloves.quantity
    this.glovesQuantityRemainingInGermany = itemInventory.Germany.Gloves.quantity
  }

  /**
   * Validate item type given by user
   * @param itemType item type given by user
   * @returns item type | null
   */
  getItemType(itemType) {
    return itemType === constants.mask ? constants.mask : itemType === constants.gloves ? constants.gloves : null
  }

  /**
   * Validate item quantity given by user
   * @param itemQuantity  item quantity given by user
   * @returns item quantity | null
   */
  getItemQuantity(itemQuantity) {
    return parseInt(itemQuantity) && parseInt(itemQuantity) >= 0 ? parseInt(itemQuantity) : null
  }

  /**
   * Validate user inputs
   * @returns Object with following keys (error, message, data<Input Data>)
   */
  validateInputString() {
    const returnObject = {
      error: false,
      message: '',
      data: {}
    }
    if (this.inputString) {
      const tempInputArray = this.inputString.split(constants.splitCharacter)
      if (tempInputArray.length === 6 || tempInputArray.length === 5) {
        const country = tempInputArray[0] === constants.countryUK ? constants.countryUK : tempInputArray[0] === constants.countryGermany ? constants.countryGermany : null
        const passportCountry = tempInputArray.length === 5 ? constants.notApplicable : constants.passportPatternUK.test(tempInputArray[1]) ? constants.countryUK : constants.passportPatternGermany.test(tempInputArray[1]) ? constants.countryGermany : null
        const firstItemType = tempInputArray.length === 5 ? this.getItemType(tempInputArray[1]) : this.getItemType(tempInputArray[2])
        const secondItemType = tempInputArray.length === 5 ? this.getItemType(tempInputArray[3]) : this.getItemType(tempInputArray[4])
        const firstItemQuantity = tempInputArray.length === 5 ? this.getItemQuantity(tempInputArray[2]) : this.getItemQuantity(tempInputArray[3])
        const secondItemQuantity = tempInputArray.length === 5 ? this.getItemQuantity(tempInputArray[4]) : this.getItemQuantity(tempInputArray[5])
        if (country && passportCountry && firstItemType && secondItemType && (firstItemType != secondItemType) && (firstItemQuantity || firstItemQuantity === 0) && (secondItemQuantity || secondItemQuantity === 0)) {
          returnObject.data = {
            country: country,
            passportCountry: passportCountry,
            firstItemType: firstItemType,
            firstItemQuantity: firstItemQuantity,
            secondItemType: secondItemType,
            secondItemQuantity: secondItemQuantity
          }
        } else {
          returnObject.error = true
          returnObject.message = 'Invalid input'
        }
      } else {
        returnObject.error = true
        returnObject.message = 'Invalid input'
      }
    } else {
      returnObject.error = true
      returnObject.message = 'Invalid input'
    }
    return returnObject
  }

}