const Address = require('../models/Address');
const AddressSchema = require('../schemas/AddressSchema');
const User = require('../models/User');

class AddressController {
    static async index(req, res) {

        const id_user = req.params.id;

        if (isNaN(parseInt(id_user)))
            return res.status(400).send({ success: false, message: 'Id de usuário inválido!' });


        let page = req.query.page;
        if (isNaN(parseInt(page))) page = '1';

        const address = await Address.findAll(id_user, page);
        return address.success ? res.send(address) : res.status(404).send(address);
    }

    static async show(req, res) {
        const id = req.params.id;

        if (isNaN(parseInt(id)))
            return res.status(400).send({ success: false, message: 'Id de endereço inválido!' });


        const address = await Address.findOne(id);

        if (address.success && address.address.id_user !== req.locals.id_user && req.locals.type !== 'A')
            return res.status(403).send({ success: false, message: 'Você não tem autorização para acessar este endereço!' });

        return address.success ? res.send(address) : res.status(404).send(address);
    }

    static async showUserAddress(req,res) {
        const id_user = req.params.id;

        if (isNaN(parseInt(id_user)))
            return res.status(400).send({ success: false, message: 'Id de usuário inválido!' });



        const address = await Address.findUser(id_user);
        return address.success ? res.send(address) : res.status(404).send(address);


    }

    static async create(req, res) {
        const schema = AddressSchema.createValidate();
        const { error } = schema.validate(req.body);

        if (error)
            return res.status(400).send({ success: false, message: error.details[0].message });


        const { id_user, alias } = req.body;

        const user = await User.findOne(id_user);

        if (!user.success)
            return res.status(404).send(user);


        if (user.user.type === 'V') {
            const address = await Address.findAll(id_user, 1);

            if (address.success)
                return res.status(409).send({ success: false, message: 'Vendedor já possui um endereço cadastrado!' });

        } else {
            const existAlias = await Address.findByUserAlias(id_user, alias);
            if (existAlias.address)
                return res.status(409).send({ success: false, message: 'Apelido de endereço já cadastrado!' });
        }

        const result = await Address.create(req.body, user.user.type);
        return result.success ? res.status(201).send(result) : res.status(400).send(result);
    }

    static async update(req, res) {
        const schema = AddressSchema.updateValidate();
        const { error } = schema.validate(req.body);

        if (error)
            return res.status(400).send({ success: false, message: error.details[0].message });


        const { id, alias, street, neigh, complement, num, zipcode, city, state, country } = req.body;

        const form = {
            id,
            alias,
            street,
            neigh,
            complement,
            num,
            zipcode,
            city,
            state,
            country
        };

        const address = await Address.findOne(form.id);

        if (address.success && address.address.id_user !== req.locals.id_user && req.locals.type !== 'A')
            return res.status(403).send({ success: false, message: 'Você não tem autorização para acessar este endereço!' });

        if (address.success) {

            const toUpdate = {};

            if (form.alias && address.alias !== form.alias) toUpdate.alias = form.alias;

            if (form.street && address.street !== form.street) toUpdate.street = form.street;

            if (form.neigh && address.neigh !== form.neigh) toUpdate.neigh = form.neigh;

            if (form.num && address.num !== form.num) toUpdate.num = form.num

            if (form.complement && address.complement !== form.complement) toUpdate.complement = form.complement;

            if (form.city && address.city !== form.city) toUpdate.city = form.city;

            if (form.state && address.state !== form.state) toUpdate.state = form.state;

            if (form.country && address.country !== form.country) toUpdate.country = form.country;

            if (Object.keys(toUpdate).length) {
                toUpdate.id = form.id;

                const result = await Address.update(toUpdate);
                return result.success ? res.send(result) : res.status(400).send(result);
            }
            return res.send(address);
        } else {
            return res.status(404).send({ success: false, message: 'Não foi possível encontrar o endereço!' });
        }
    }

    static async delete(req, res) {
        const id = req.params.id;

        if (isNaN(parseInt(id)))
            return res.status(400).send({ success: false, message: 'Id de endereço inválido!' });


        const address = await Address.findOne(id);
        if (!address.success)
            return res.status(404).send({ success: false, message: 'Endereço inexistente!' });
        
        if (address.address.id_user !== req.locals.id_user && req.locals.type !== 'A')
            return res.status(403).send({ success: false, message: 'Você não tem autorização para acessar este endereço!' });

        const result = await Address.delete(id);
        return result.success ? res.send(result) : res.status(400).send(result);
    }
}

module.exports = AddressController;
