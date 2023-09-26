const AuthenticationRepository = require('../AuthenticationRepository');

// describe('AuthenticationRepository interface', () => {
//   it('should throw error when invoke unimplemented method', async () => {
//     // Arrange
//     const authenticationRepository = new AuthenticationRepository();

//     // Action & Assert
//     await expect(authenticationRepository.addToken('')).rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
//     await expect(authenticationRepository.checkAvailabilityToken('')).rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
//     await expect(authenticationRepository.deleteToken('')).rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
//   });
// });

describe('AuthenticationRepository interface', () => {
  let authenticationRepository;

  beforeEach(() => {
    // Create an instance of AuthenticationRepository before each test
    authenticationRepository = new AuthenticationRepository();
  });

  it('should throw an error when calling addToken', async () => {
    // Arrange

    // Act & Assert
    await expect(authenticationRepository.addToken('token')).rejects.toThrow('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw an error when calling checkAvailabilityToken', async () => {
    // Arrange

    // Act & Assert
    await expect(authenticationRepository.checkAvailabilityToken('token')).rejects.toThrow(
      'AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
  });

  it('should throw an error when calling deleteToken', async () => {
    // Arrange

    // Act & Assert
    await expect(authenticationRepository.deleteToken('token')).rejects.toThrow('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});

