const axios = require('axios');
const fs = require('fs');

jest.mock('axios');
jest.mock('fs');

const { mainFunction } = require('./index'); // if your code is inside a function

describe('Tests for index.js', () => {
  beforeEach(() => {
    // Setup
    axios.post.mockReset();
    fs.readFileSync.mockReset();
  });

  it('should successfully assign a role to a team', async () => {
    // Arrange
    const mockData = {
      organization: "org",
      slug: "slug",
      actor: "actor",
      actor_type: "ActorType"
    };
    const mockOrgResponse = { data: { data: { organization: { id: '1' } } } };
    const mockTeamResponse = { data: { data: { organization: { team: { id: '1' } } } } };
    const mockRoleResponse = { data: { data: { grantMigratorRole: { success: true } } } };

    fs.readFileSync.mockReturnValueOnce(JSON.stringify(mockData));
    axios.post.mockResolvedValueOnce(mockOrgResponse);
    axios.post.mockResolvedValueOnce(mockTeamResponse);
    axios.post.mockResolvedValueOnce(mockRoleResponse);

    // Act
    await mainFunction(); // if your code is inside a function

    // Assert
    expect(fs.readFileSync).toHaveBeenCalledWith('team.json', 'utf8');
    expect(axios.post).toHaveBeenCalledTimes(3);
  });

  it('should throw an error when axios post fails', async () => {
    // Arrange
    const error = new Error('Network error');
    
    fs.readFileSync.mockImplementationOnce(() => {
      throw error;
    });

    // Act
    try {
      await mainFunction(); // if your code is inside a function
    } catch (e) {
      // Assert
      expect(e).toEqual(error);
    }
  });
});
