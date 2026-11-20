import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';

const renderNavbar = (props = {}) => {
  const handlers = {
    onPermitChange: vi.fn(),
    onOpenAccount: vi.fn(),
    onOpenAdmin: vi.fn()
  };
  const view = render(
    <Navbar isMobile={false} permitFilter="All" currentUser={null} {...handlers} {...props} />
  );
  return { ...view, ...handlers };
};

const menu = () => screen.queryByRole('navigation', { name: 'Main menu' });
const button = (name) => screen.getByRole('button', { name });

describe('Navbar: desktop', () => {
  it('shows the permit filter, account, and admin inline with no hamburger', () => {
    renderNavbar();
    expect(button('All Lots')).toBeInTheDocument();
    expect(button('Green (General)')).toBeInTheDocument();
    expect(button('Yellow (Staff)')).toBeInTheDocument();
    expect(button('Account')).toBeInTheDocument();
    expect(button('Admin')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open menu' })).not.toBeInTheDocument();
  });

  it('highlights the active permit', () => {
    renderNavbar({ permitFilter: 'Student' });
    expect(button('Green (General)')).toHaveClass('active');
    expect(button('All Lots')).not.toHaveClass('active');
  });

  it('shows the signed-in username in place of Account', () => {
    renderNavbar({ currentUser: { username: 'bulldog_student' } });
    expect(button('bulldog_student')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Account' })).not.toBeInTheDocument();
  });

  it('passes clicks through to the handlers', async () => {
    const { onPermitChange, onOpenAccount, onOpenAdmin } = renderNavbar();
    await userEvent.click(button('Yellow (Staff)'));
    await userEvent.click(button('Account'));
    await userEvent.click(button('Admin'));
    expect(onPermitChange).toHaveBeenCalledWith('Staff');
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
    expect(onOpenAdmin).toHaveBeenCalledTimes(1);
  });
});

describe('Navbar: mobile', () => {
  it('hides the options behind the hamburger until it is opened', async () => {
    renderNavbar({ isMobile: true });
    expect(menu()).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Account' })).not.toBeInTheDocument();
    expect(button('Open menu')).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(button('Open menu'));
    expect(menu()).toBeInTheDocument();
    expect(menu()).toHaveClass('open');
    expect(button('Open menu')).toHaveAttribute('aria-expanded', 'true');
    expect(button('Account')).toBeInTheDocument();
  });

  it('closes from the close button', async () => {
    renderNavbar({ isMobile: true });
    await userEvent.click(button('Open menu'));
    await userEvent.click(button('Close menu'));
    expect(menu()).not.toBeInTheDocument();
  });

  it('closes when the backdrop is tapped', async () => {
    const { container } = renderNavbar({ isMobile: true });
    await userEvent.click(button('Open menu'));
    await userEvent.click(container.querySelector('.menu-backdrop'));
    expect(menu()).not.toBeInTheDocument();
  });

  it('applies a permit and closes the menu', async () => {
    const { onPermitChange } = renderNavbar({ isMobile: true });
    await userEvent.click(button('Open menu'));
    await userEvent.click(button('Yellow (Staff)'));
    expect(onPermitChange).toHaveBeenCalledWith('Staff');
    expect(menu()).not.toBeInTheDocument();
  });

  it('opens account and admin and closes the menu', async () => {
    const { onOpenAccount, onOpenAdmin } = renderNavbar({ isMobile: true });

    await userEvent.click(button('Open menu'));
    await userEvent.click(button('Account'));
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
    expect(menu()).not.toBeInTheDocument();

    await userEvent.click(button('Open menu'));
    await userEvent.click(button('Admin'));
    expect(onOpenAdmin).toHaveBeenCalledTimes(1);
    expect(menu()).not.toBeInTheDocument();
  });
});

describe('Navbar: mobile menu edge cases', () => {
  it('closes on Escape and claims the key so nothing underneath also reacts', async () => {
    renderNavbar({ isMobile: true });
    await userEvent.click(button('Open menu'));

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    act(() => window.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(true);
    expect(menu()).not.toBeInTheDocument();
  });

  it('does not reopen by itself after rotating to landscape and back', async () => {
    const props = { permitFilter: 'All', currentUser: null, onPermitChange: () => {}, onOpenAccount: () => {}, onOpenAdmin: () => {} };
    const { rerender } = render(<Navbar isMobile {...props} />);
    await userEvent.click(button('Open menu'));

    rerender(<Navbar isMobile={false} {...props} />);
    rerender(<Navbar isMobile {...props} />);
    expect(menu()).not.toBeInTheDocument();
    expect(button('Open menu')).toHaveAttribute('aria-expanded', 'false');
  });
});
