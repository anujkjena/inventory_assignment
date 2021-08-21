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
      const tempMaskResultUK = this.calculateMaskQuantityUK(maskQuantity)
      maskQuantityPickFromUK = tempMaskResultUK.maskQuantityPickFromUK
      maskQuantityPickFromGermany = tempMaskResultUK.maskQuantityPickFromGermany
      price += maskQuantityPickFromUK * itemInventory.UK.Mask.price + maskQuantityPickFromGermany * itemInventory.Germany.Mask.price
      price += maskQuantityPickFromGermany === 0 ? 0 : this.calculateShippingCharge(maskQuantityPickFromGermany, constants.countryGermany, inputData.data.passportCountry)
      const tempGlovesResultUK = this.calculateGlovesQuantityUK(glovesQuantity)
      glovesQuantityPickFromUK = tempGlovesResultUK.glovesQuantityPickFromUK
      glovesQuantityPickFromGermany = tempGlovesResultUK.glovesQuantityPickFromGermany
      price += glovesQuantityPickFromUK * itemInventory.UK.Gloves.price + glovesQuantityPickFromGermany * itemInventory.Germany.Gloves.price
      price += glovesQuantityPickFromGermany === 0 ? 0 : this.calculateShippingCharge(glovesQuantityPickFromGermany, constants.countryGermany, inputData.data.passportCountry)
      return `${price}:${this.maskQuantityRemainingInUK}:${this.maskQuantityRemainingInGermany}:${this.glovesQuantityRemainingInUK}:${this.glovesQuantityRemainingInGermany}`
    } else {
      const tempMaskResultGermany = this.calculateMaskQuantityGermany(maskQuantity)
      maskQuantityPickFromUK = tempMaskResultGermany.maskQuantityPickFromUK
      maskQuantityPickFromGermany = tempMaskResultGermany.maskQuantityPickFromGermany
      price += maskQuantityPickFromUK * itemInventory.UK.Mask.price + maskQuantityPickFromGermany * itemInventory.Germany.Mask.price
      price += maskQuantityPickFromGermany === 0 ? 0 : this.calculateShippingCharge(maskQuantityPickFromUK, constants.countryUK, inputData.data.passportCountry)
      const tempGlovesResultGermany = this.calculateGlovesQuantityGermany(glovesQuantity)
      glovesQuantityPickFromUK = tempGlovesResultGermany.glovesQuantityPickFromUK
      glovesQuantityPickFromGermany = tempGlovesResultGermany.glovesQuantityPickFromGermany
      price += glovesQuantityPickFromUK * itemInventory.UK.Gloves.price + glovesQuantityPickFromGermany * itemInventory.Germany.Gloves.price
      price += glovesQuantityPickFromGermany === 0 ? 0 : this.calculateShippingCharge(glovesQuantityPickFromUK, constants.countryUK, inputData.data.passportCountry)
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
   * Calculate required gloves quantity in UK & Germany inventory when user place order in Germany
   * @param glovesQuantity required gloves quantity
   * @returns An object with following keys(glovesQuantityPickFromUK , glovesQuantityPickFromGermany)
   */
  calculateGlovesQuantityGermany(glovesQuantity) {
    const returnObject = {
      glovesQuantityPickFromGermany: 0,
      glovesQuantityPickFromUK: 0
    }
    if( glovesQuantity >= this.glovesQuantityRemainingInGermany) {
      returnObject.glovesQuantityPickFromGermany = this.glovesQuantityRemainingInGermany
      this.glovesQuantityRemainingInGermany = 0
      returnObject.glovesQuantityPickFromUK = glovesQuantity === this.glovesQuantityRemainingInGermany ? 0 :  glovesQuantity - returnObject.glovesQuantityPickFromGermany
      this.glovesQuantityRemainingInUK = this.glovesQuantityRemainingInUK - returnObject.glovesQuantityPickFromUK
    } else {
      returnObject.glovesQuantityPickFromGermany = glovesQuantity
      this.glovesQuantityRemainingInGermany = this.glovesQuantityRemainingInGermany - returnObject.glovesQuantityPickFromGermany
      returnObject.glovesQuantityPickFromUK = 0
    }
    return returnObject
  }

  /**
   * Calculate required mask quantity in UK & Germany inventory when user place order in Germany
   * @param maskQuantity required mask quantity
   * @returns An object with following keys(maskQuantityPickFromUK , maskQuantityPickFromGermany)
   */
  calculateMaskQuantityGermany(maskQuantity) {
    const returnObject = {
      maskQuantityPickFromGermany: 0,
      maskQuantityPickFromUK: 0
    }
    if( maskQuantity >= this.maskQuantityRemainingInGermany) {
      returnObject.maskQuantityPickFromGermany = this.maskQuantityRemainingInGermany
      this.maskQuantityRemainingInGermany = 0
      returnObject.maskQuantityPickFromUK = maskQuantity === this.maskQuantityRemainingInGermany ? 0 :  maskQuantity - returnObject.maskQuantityPickFromGermany
      this.maskQuantityRemainingInUK = this.maskQuantityRemainingInUK - returnObject.maskQuantityPickFromUK
    } else {
      returnObject.maskQuantityPickFromGermany = maskQuantity
      this.maskQuantityRemainingInGermany = this.maskQuantityRemainingInGermany - returnObject.maskQuantityPickFromGermany
      returnObject.maskQuantityPickFromUK = 0
    }
    return returnObject
  }

  /**
   * Calculate required gloves quantity in UK & Germany inventory when user place order in UK
   * @param glovesQuantity required gloves quantity
   * @returns An object with following keys(glovesQuantityPickFromUK , glovesQuantityPickFromGermany)
   */
  calculateGlovesQuantityUK(glovesQuantity) {
    const returnObject = {
      glovesQuantityPickFromUK: 0,
      glovesQuantityPickFromGermany: 0
    }
    if( glovesQuantity >= this.glovesQuantityRemainingInUK) {
      returnObject.glovesQuantityPickFromUK = this.glovesQuantityRemainingInUK
      this.glovesQuantityRemainingInUK = 0
      returnObject.glovesQuantityPickFromGermany = glovesQuantity === this.glovesQuantityRemainingInUK ? 0 :  glovesQuantity - returnObject.glovesQuantityPickFromUK
      this.glovesQuantityRemainingInGermany = this.glovesQuantityRemainingInGermany - returnObject.glovesQuantityPickFromGermany
    } else {
      returnObject.glovesQuantityPickFromUK = glovesQuantity
      this.glovesQuantityRemainingInUK = this.glovesQuantityRemainingInUK - returnObject.glovesQuantityPickFromUK
      returnObject.glovesQuantityPickFromGermany = 0
    }
    return returnObject
  }

  /**
   * Calculate required mask quantity in UK & Germany inventory when user place order in UK
   * @param maskQuantity required mask quantity
   * @returns An object with following keys(maskQuantityPickFromUK , maskQuantityPickFromGermany)
   */
  calculateMaskQuantityUK(maskQuantity) {
    const returnObject = {
      maskQuantityPickFromUK: 0,
      maskQuantityPickFromGermany: 0
    }
    if( maskQuantity >= this.maskQuantityRemainingInUK) {
      returnObject.maskQuantityPickFromUK = this.maskQuantityRemainingInUK
      this.maskQuantityRemainingInUK = 0
      returnObject.maskQuantityPickFromGermany = maskQuantity === this.maskQuantityRemainingInUK ? 0 :  maskQuantity - returnObject.maskQuantityPickFromUK
      this.maskQuantityRemainingInGermany = this.maskQuantityRemainingInGermany - returnObject.maskQuantityPickFromGermany
    } else {
      returnObject.maskQuantityPickFromUK = maskQuantity
      this.maskQuantityRemainingInUK = this.maskQuantityRemainingInUK - returnObject.maskQuantityPickFromUK
      returnObject.maskQuantityPickFromGermany = 0
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