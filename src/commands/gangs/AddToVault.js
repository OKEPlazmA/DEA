const patron = require('patron.js');
const Constants = require('../../utility/Constants.js');
const NumberUtil = require('../../utility/NumberUtil.js');

class AddToVault extends patron.Command {
  constructor() {
    super({
      names: ['addtovault', 'addvault', 'deposititem', 'addtogang'],
      groupName: 'gangs',
      description: 'Add an item to a gangs vault.',
      preconditions: ['ingang'],
      args: [
        new patron.Argument({
          name: 'item',
          key: 'item',
          type: 'item',
          example: 'intervention',
          preconditions: ['donthave'],
        }),
        new patron.Argument({
          name: 'amount',
          key: 'amount',
          type: 'int',
          example: '2',
          defaultValue: 1,
          preconditionOptions: [{ minimum: 1 }],
          preconditions: ['minimum', 'userhasamount'],
          remainder: true
        })
      ]
    });
  }

  async run(msg, args) {
    const inv = 'inventory.' + args.item.names[0];
    const vault = 'vault.' + args.item.names[0];

    const gang = await msg.client.db.gangRepo.findOne({ $or: [{ members: msg.author.id }, { elders: msg.author.id }, { leaderId: msg.author.id }], $and: [{ guildId: msg.guild.id }] });

    await msg.client.db.userRepo.updateUser(msg.author.id, msg.guild.id, { $inc: { [inv]: -args.amount } });
    await msg.client.db.gangRepo.updateGang(gang.leaderId, msg.guild.id, { $inc: { [vault]: args.amount } });

    return msg.createReply('you have successfully  added ' + args.amount + ' of ' + (args.amount > 1 ? args.item.names[0] + 's' : args.item.names[0]) + ' to your gangs vault.');
  }
}

module.exports = new AddToVault();