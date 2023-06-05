import pyrebase

config = {
  "apiKey": "AIzaSyCTsGEWfv3fakbUhiKzc9AiBXiS-kAyX3g",
  "authDomain": "codesearch-91204.firebaseapp.com",
  "databaseURL": "https://codesearch-91204-default-rtdb.firebaseio.com",
  "projectId": "codesearch-91204",
  "storageBucket": "codesearch-91204.appspot.com",
  "messagingSenderId": "637948241608",
  "appId": "1:637948241608:web:46962b6d5b609ee12067fd",
  "databaseURL": "https://codesearch-91204-default-rtdb.firebaseio.com/",
}

firebase = pyrebase.initialize_app(config)
db = firebase.database()

# CRUD Operations
def create_user(user_id, email, api_key):
    try:
        db.child("users/" + str(user_id)).push({"email" : email, "apiKey" : api_key})
        print("Data created successfully!")
    except Exception as e:
        print("Data creation failed:", str(e))

def get_user(email):
    try:
        all_data = db.child("users").get()
        api_key = [list(all_data.val()[i].values())[0] for i in range(len(all_data.val())) if list(all_data.val()[i].values())[0]['email'] == email][0]['api_key']

    except Exception as e:
        print ("API key retrieval failed.")

def read_data():
    try:
        all_data = db.child("users").get()
        for data in all_data.each():
            print(data.key(), data.val().values())
    except Exception as e:
        print("Data retrieval failed:", str(e))



def delete_data(key):
    try:
        db.child("collection").child(key).remove()
        print("Data deleted successfully!")
    except Exception as e:
        print("Data deletion failed:", str(e))

get_user("deets@gmail.com")