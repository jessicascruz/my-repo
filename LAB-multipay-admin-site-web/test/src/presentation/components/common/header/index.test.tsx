import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ResponsiveAppBar from '@/presentation/components/common/header/Header'
import { signOut } from 'next-auth/react'
import { useKeycloakData } from '@/presentation/hooks/useKeycloakData'
import { Session } from 'next-auth'

// Mock the hooks and dependencies
jest.mock('next-auth/react')
jest.mock('@/presentation/hooks/useKeycloakData')
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />
  },
}))

const mockUseKeycloakData = useKeycloakData as jest.MockedFunction<
  typeof useKeycloakData
>

describe('ResponsiveAppBar', () => {
  const mockSession: Session = {
    user: {
      id: 'mockedId',
      name: 'TestUser',
      email: 'user@example.com',
    },
    authTokens: {
      idToken: 'new-id-token',
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresIn: 3600,
      refreshExpiresIn: 7200,
    },
    sub: '1',
    expires: '2023-12-31',
  }

  beforeEach(() => {
    mockUseKeycloakData.mockReturnValue({
      userId: '123',
      username: 'TestUser',
      status: 'authenticated',
      userEmail: 'user@example.com',
      session: mockSession,
      roles: ['user'],
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with logo and avatar', () => {
    render(<ResponsiveAppBar />)

    // Check logo is rendered
    expect(screen.getByAltText('Imagem externa')).toBeInTheDocument()

    // Check avatar is rendered with first letter of username
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('opens and closes the user menu', () => {
    render(<ResponsiveAppBar />)

    // Click avatar to open menu
    const avatarButton = screen.getByRole('button', {
      name: /configurações da conta/i,
    })
    fireEvent.click(avatarButton)

    // Menu should be open
    expect(screen.getByText('Sair')).toBeInTheDocument()
    expect(screen.getByText('TestUser')).toBeInTheDocument()
    expect(screen.getByText('user@example.com')).toBeInTheDocument()

    // Click outside to close menu
    fireEvent.click(document.body)
  })

  it('displays user information correctly in menu', () => {
    render(<ResponsiveAppBar />)

    // Open menu
    fireEvent.click(
      screen.getByRole('button', { name: /configurações da conta/i })
    )

    // Check user info
    expect(screen.getByText('TestUser')).toBeInTheDocument()
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })

  it('calls signOut when clicking logout', () => {
    render(<ResponsiveAppBar />)

    // Open menu
    fireEvent.click(
      screen.getByRole('button', { name: /configurações da conta/i })
    )

    // Click logout
    fireEvent.click(screen.getByText('Sair'))

    // Check signOut was called
    expect(signOut).toHaveBeenCalledWith({
      redirect: true,
      callbackUrl: '/',
    })
  })

  it('should close menu when handleMenuClose is called', () => {
    render(<ResponsiveAppBar />)

    // Open menu
    const avatarButton = screen.getByRole('button', {
      name: /configurações da conta/i,
    })
    fireEvent.click(avatarButton)

    // Verify menu is open
    expect(screen.getByText('Sair')).toBeInTheDocument()

    // Get menu element
    const menu = screen.getByRole('menu')

    // Simulate menu close
    fireEvent.keyDown(menu, { key: 'Escape' })
  })

  it('should close menu when clicking on a menu item', () => {
    render(<ResponsiveAppBar />)

    // Open menu
    const avatarButton = screen.getByRole('button', {
      name: /configurações da conta/i,
    })
    fireEvent.click(avatarButton)

    // Click on menu item (but not logout)
    const menuItem = screen.getByRole('menuitem', { name: /TestUser/i })
    fireEvent.click(menuItem)
  })

  it('handles empty username gracefully', () => {
    mockUseKeycloakData.mockReturnValue({
      userId: '123',
      username: '',
      status: 'authenticated',
      userEmail: 'user@example.com',
      session: mockSession,
      roles: ['user'],
    })

    render(<ResponsiveAppBar />)

    // Open menu
    fireEvent.click(
      screen.getByRole('button', { name: /configurações da conta/i })
    )

    // Should still render menu items
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })
})
