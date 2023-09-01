const axios = require('axios');

class LowendPGD {
    static current_user = {
        email: '',
        username: '',
        server: '',
        port: '',
        password: ''
    };

    static async get_aas(domain) {
        try {
            const response = await axios.post('http://serveraas.pythonanywhere.com/protocols/aas/get', `domain=${domain}`);
            if (response.status === 200) {
                return response.data;
            } else {
                return domain;
            }
        } catch (error) {
            return domain;
        }
    }

    static async reset_aas_key(domain, secret) {
        try {
            const response = await axios.post('http://serveraas.pythonanywhere.com/protocols/aas/keychange', `domain=${domain}&secret=${secret}`);
            if (response.status === 200) {
                return response.data;
            } else {
                return response.status;
            }
        } catch (error) {
            return error.response ? error.response.status : 'ERROR';
        }
    }

    static async check_aas_key(domain, key) {
        try {
            const response = await axios.post('http://serveraas.pythonanywhere.com/protocols/aas/validate', `domain=${domain}&key=${key}`);
            if (response.status === 200) {
                return response.data;
            } else {
                return 'false';
            }
        } catch (error) {
            return 'false';
        }
    }

    static async extend_aas_record(email, password, domain, daycount) {
        try {
            const response = await axios.post('http://serveraas.pythonanywhere.com/protocols/aas/extend', `domain=${domain}&email=${email}&password=${password}&daycount=${daycount}`);
            if (response.status === 200) {
                return response.data;
            } else {
                return 'false';
            }
        } catch (error) {
            return 'false';
        }
    }

    static async get_login(email, password) {
        try {
            const aas_data = await LowendPGD.get_aas(email.split('@')[1]);
            LowendPGD.current_user.email = email;
            LowendPGD.current_user.username = email.split('@')[0];
            LowendPGD.current_user.server = aas_data;

            const response = await axios.post(`http://${LowendPGD.current_user.server}/protocols/pgd/current_user_info`, `current_user_username=${LowendPGD.current_user.username}&current_user_password=${LowendPGD.current_user.password}`);
            const data = response.data;
            data.email = email;
            return data;
        } catch (error) {
            return 'NOLOGIN';
        }
    }
}

class PGD {
    static async login(email, password) {
        await LowendPGD.get_login(email, password);

        try {
            const response = await axios.post(`http://${LowendPGD.current_user.server}/protocols/pgd/current_user_info`, `current_user_username=${LowendPGD.current_user.username}&current_user_password=${LowendPGD.current_user.password}`);
            const data = response.data;
            data.email = email;
            return data;
        } catch (error) {
            return 'NOLOGIN';
        }
    }

    static async pull_mails(email, password) {
        await LowendPGD.get_login(email, password);

        try {
            const response = await axios.post(`http://${LowendPGD.current_user.server}/protocols/pgd/pull_mails`, `current_user_username=${LowendPGD.current_user.username}&current_user_password=${LowendPGD.current_user.password}`);
            return response.data;
        } catch (error) {
            return 'ERROR';
        }
    }

    static async move_mail(email, password, mailbox, mail, move_to) {
        await LowendPGD.get_login(email, password);

        try {
            await axios.post(`http://${LowendPGD.current_user.server}/protocols/pgd/move_mail`, `current_user_username=${LowendPGD.current_user.username}&current_user_password=${LowendPGD.current_user.password}&mailbox=${mailbox}&mail=${mail}&move_to=${move_to}`);
        } catch (error) {  }
    }

    static async send_mail(email, password, title, to, cc, bcc, content) {
        await LowendPGD.get_login(email, password);

        try {
            await axios.post(`http://${LowendPGD.current_user.server}/protocols/pgd/send_mail`, `current_user_username=${LowendPGD.current_user.username}&current_user_password=${LowendPGD.current_user.password}&to=${to}&cc=${cc}&bcc=${bcc}&content=${content}&title=${title}`);
        } catch (error) {  }
    }

    static async find_user(email) {
        const aas_data = await LowendPGD.get_aas(email.split('@')[1]);

        try {
            const response = await axios.post(`http://${aas_data}/protocols/pgd/user_info`, `username=${email.split('@')[0]}`);
            return response.data;
        } catch (error) {      return 'ERROR';
        }
    }

    static async web_search(instance, key) {
        const aas_data = await LowendPGD.get_aas(instance);

        try {
            const response = await axios.post(`http://${aas_data}/protocols/pgd/web_search_results`, `key=${key}`);
            return response.data.results;
        } catch (error) {      return [];
        }
    }

    static async get_network_feed(instance) {
        const aas_data = await LowendPGD.get_aas(instance);

        try {
            const response = await axios.post(`http://${aas_data}/protocols/pgd/get_network_feed`);
            return response.data.feed;
        } catch (error) {      return [];
        }
    }

    static async set_user_data(email, password, key, data) {
        await LowendPGD.get_login(email, password);

        try {
            await axios.post(`http://${LowendPGD.current_user.server}/protocols/pgd/set_user_data`, `current_user_username=${LowendPGD.current_user.username}&current_user_password=${LowendPGD.current_user.password}&key=${key}&data=${data}`);
        } catch (error) {  }
    }

    static async signup(instance, username, birthday, country, gender, name, password, phone_number, postcode, surname, timezone) {
        const aas_data = await LowendPGD.get_aas(instance);
        const data = {
            username,
            birthday,
            country,
            gender,
            name,
            password,
            phone_number,
            postcode,
            surname,
            timezone
        };

        try {
            await axios.post(`http://${aas_data}/protocols/pgd/signup`, data);
        } catch (error) {  }
    }

    static async administration(instance, password, command) {
        const aas_data = await LowendPGD.get_aas(instance);
        try {
            const response = await axios.post(`http://${aas_data}/protocols/pgd/administration`, `password=${password}&command=${command}`);
            console.log(response.data);
        } catch (error) {  }
    }
}
