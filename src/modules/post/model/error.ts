export const ErrPostNotFound = new Error('Post not found');
export const ErrAuthorNotFound = new Error('Author not found');

export const ErrMinContent = (num: number) => new Error(`The content must be at least ${num} characters`);
export const ErrURLInvalid = new Error('Invalid URL');

export const ErrTopicNotFound = new Error("Topic not found");
export const ErrTopicNameInvalid = new Error("Topic name is invalid, must be at least 3 characters");
export const ErrTopicNameAlreadyExists = new Error("Topic name already exists");
export const ErrTopicColorInvalid = new Error("Topic color is invalid, must be a valid hex color code");