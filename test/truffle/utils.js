function promisify(inner) {
  return new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res);
    })
  )
}

async function expectThrow(func, msg) {
  let result
  try {
    result = await func
  } catch (error) {
    const invalidJump = error.message.search('invalid JUMP') >= 0
    const invalidOpcode = error.message.search('invalid opcode') >= 0
    const outOfGas = error.message.search('out of gas') >= 0
    assert(invalidJump || invalidOpcode || outOfGas, "Expected throw, got '" + error + "' instead")
    return
  }

  if(typeof msg === 'string') {
    assert.fail(msg)
  } else if (typeof msg === 'function') {
    assert.fail(msg(result))
  } else {
    assert.fail('Expected throw not received')
  }
}

function getBalance(account, at) {
  return promisify(cb => web3.eth.getBalance(account, at, cb))
}

module.exports = {
  promisify,
  getBalance,
  expectThrow
}