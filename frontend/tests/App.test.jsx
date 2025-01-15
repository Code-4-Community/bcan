import { render } from '@testing-library/react';

import App from '../src/App';

import { AuthProvider } from '../src/context/auth/authContext';

describe('App', () => {
  it('renders App', () => {
    render(<AuthProvider>
              <App/>
                </AuthProvider>);

    // Is very annoying in console, use at discretion.
    //screen.debug(); // print out the state of the DOM
  });
});