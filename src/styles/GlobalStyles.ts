import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #1a1a1a;
    color: #ffffff;
  }

  button {
    font-family: inherit;
  }

  /* Remove default button styles */
  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  /* Remove default link styles */
  a {
    text-decoration: none;
    color: inherit;
  }
`

export default GlobalStyles 