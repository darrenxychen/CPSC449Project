USE WaveGenDB;

CREATE TABLE Users(
	user_id INT PRIMARY KEY,
	user_name VARCHAR(255),
	spotify_user_id VARCHAR(255),
	spotify_access_token VARCHAR(255)
);

CREATE TABLE Song(
	song_id INT PRIMARY KEY,
	spotify_id VARCHAR(255),
	song_name VARCHAR(255),
	artist VARCHAR(255),
	genre VARCHAR(255),
	music_key VARCHAR(255),
	tempo INT,
	emotion VARCHAR(255)
);

CREATE Table Recommendations(
	recommendation_id INT PRIMARY KEY,
	user_id INT,
	song_id INT,
	recommendation_reasoning VARCHAR,
	FOREIGN KEY (user_id) REFERENCES Users(user_id),
	FOREIGN KEY (song_id) REFERENCES Song(song_id)
	
);

CREATE Table User_Song_Preferences(
	preference_id INT PRIMARY KEY,
	user_id INT,
	song_id INT,
	ai_analysis VARCHAR(255),
	FOREIGN KEY (user_id) REFERENCES Users(user_id),
	FOREIGN KEY (song_id) REFERENCES Song(song_id)
);




