-- Create the User table
CREATE TABLE IF NOT EXISTS "User" (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    age INT,
    genre CHAR(1),
    bio TEXT,
    sexual_pref CHAR(1),
    salt VARCHAR(255),
    tags JSONB,
    images VARCHAR(50)[],
    online BOOLEAN,
    last_connection TIMESTAMP,
    pwd_hashed VARCHAR(255),
    visitic_historic JSONB,
    friendship JSONB,
    conversations JSONB,
    notifications JSONB,
    filtertag JSONB,
    filter_fame_rate FLOAT,
    age_gap INT[],
    token VARCHAR(255),
    blocked INT[],
    nexted INT[]
);

-- Create the Notification table
CREATE TABLE IF NOT EXISTS Notification (
    notificationId SERIAL PRIMARY KEY,
    sourceUserId INT,
    type CHAR(1),
    created_at TIMESTAMP
);

-- Create the Conversation table
CREATE TABLE IF NOT EXISTS Conversation (
    conversationId SERIAL PRIMARY KEY,
    userId1 INT,
    userId2 INT,
    messages JSONB,
    created_at TIMESTAMP,
    last_msg TIMESTAMP
);

-- Create the Message table
CREATE TABLE IF NOT EXISTS Message (
    messageId SERIAL PRIMARY KEY,
    sourceUserId INT,
    targetUserId INT,
    content TEXT,
    created_at TIMESTAMP
);

-- Create the Friendship table
CREATE TABLE IF NOT EXISTS Friendship (
    friendshipId SERIAL PRIMARY KEY,
    sourceUserId INT,
    targetUserId INT,
    status CHAR(1),
    created_at TIMESTAMP,
    notificationId INT
);

-- Create the VisitHistory table
CREATE TABLE IF NOT EXISTS VisitHistory (
    visitId SERIAL PRIMARY KEY,
    sourceUserId INT,
    targetUserId INT,
    created_at TIMESTAMP,
    notificationId INT
);

-- Create the Tag table
CREATE TABLE IF NOT EXISTS Tag (
    tagId SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE
);
