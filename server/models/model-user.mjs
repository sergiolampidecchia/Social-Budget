import dayjs from "dayjs";

export default function User(id, username, hash, role, name, surname, address, birthday, salt){
    this.id = id;
    this.username = username;
    this.hash = hash;
    this.role = role;
    this.name = name;
    this.surname = surname;
    this.address = address;
    this.birthday = dayjs(birthday).format('YYYY-MM-DD');
    this.salt = salt;
}