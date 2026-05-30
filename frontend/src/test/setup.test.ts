describe('test setup', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have jest-dom matchers available', () => {
    const div = document.createElement('div')
    div.textContent = 'hello'
    document.body.appendChild(div)

    expect(div).toBeInTheDocument()
    expect(div).toHaveTextContent('hello')

    document.body.removeChild(div)
  })
})