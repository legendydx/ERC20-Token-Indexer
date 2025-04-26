
export const base_url = "http://127.0.0.1:3000/api/";

export const getTokenFromLocalStorage = () =>{
    return localStorage.getItem("customer")
    ? JSON.parse(localStorage.getItem("customer"))
    : null;
}

export const config = {
    headers: {
        Authorization: `Bearer ${ getTokenFromLocalStorage()?.token || ""}`,
        Accept: "application/json",
    },
};
