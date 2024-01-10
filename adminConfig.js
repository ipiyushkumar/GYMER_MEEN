const admins = {
    "piyushat115@gmail.com" :true,
    "akshatgarg071@gmail.com" :true,
    "aami.mohdmedium@gmail.com" :true,
}

const adminAuthenticater = email => {
    if (admins[email]) {
        return true;
    } else {
        return false;
    }
} 

module.exports = {adminAuthenticater}