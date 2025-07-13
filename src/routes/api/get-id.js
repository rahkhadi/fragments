const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const { id } = req.params;

  try {
    const fragment = await Fragment.byId(ownerId, id);
    const data = await fragment.getData();

    res.setHeader('Content-Type', fragment.type);
    res.status(200).send(data);
  } catch (err) {
    console.error(`GET /fragments/${id} failed`, err);
    res.status(404).json({ status: 'error', error: 'Fragment not found' });
  }
};
