import { render, screen } from '@testing-library/react';

import App from '../src/App';

describe('App', () => {
  it('renders App', () => {
    render(<App/>);

    // Is very annoying in console, use at discretion.
    //screen.debug(); // print out the state of the DOM
  });
});