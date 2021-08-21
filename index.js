import Inventory from './inventory.js'

const inventoryObject = new Inventory();
console.log('INPUT 1: UK:B123AB1234567:Gloves:20:Mask:10')
let output = inventoryObject.calculatePriceAndInventory('UK:B123AB1234567:Gloves:20:Mask:10')
console.log(`OUTPUT 1: ${output}\n`)
console.log('INPUT 2: Germany:B123AB1234567:Gloves:22:Mask:10')
output = inventoryObject.calculatePriceAndInventory('Germany:B123AB1234567:Gloves:22:Mask:10')
console.log(`OUTPUT 2: ${output}\n`)
console.log('INPUT 3: UK:AAB123456789:Gloves:125:Mask:70')
output = inventoryObject.calculatePriceAndInventory('UK:AAB123456789:Gloves:125:Mask:70')
console.log(`OUTPUT 3: ${output}\n`)
console.log('INPUT 4: Germany:AAB123456789:Mask:50:Gloves:25')
output = inventoryObject.calculatePriceAndInventory('Germany:AAB123456789:Mask:50:Gloves:25')
console.log(`OUTPUT 4: ${output}\n`)
console.log('INPUT 5: UK:Gloves:50:Mask:150')
output = inventoryObject.calculatePriceAndInventory('UK:Gloves:50:Mask:150')
console.log(`OUTPUT 5: ${output}\n`)
console.log('INPUT 6: UK:Gloves:250:Mask:150')
output = inventoryObject.calculatePriceAndInventory('UK:Gloves:250:Mask:150')
console.log(`OUTPUT 6: ${output}`)
