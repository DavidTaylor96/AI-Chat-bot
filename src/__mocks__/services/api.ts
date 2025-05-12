// Mock API service
const mockApi = {
  post: jest.fn().mockResolvedValue({
    data: {
      content: [
        {
          text: "This is a mock response from Claude API",
          type: "text"
        }
      ]
    }
  }),
  get: jest.fn().mockResolvedValue({
    data: {
      messages: []
    }
  })
};

export default mockApi;