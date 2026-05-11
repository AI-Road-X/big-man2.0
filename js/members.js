var MEMBER_LEVELS = [
  { level:1, name:'普通会员', minTrips:0, discount:1.0, color:'#95a5a6' },
  { level:2, name:'银卡会员', minTrips:3, discount:0.95, color:'#bdc3c7' },
  { level:3, name:'金卡会员', minTrips:8, discount:0.90, color:'#f1c40f' },
  { level:4, name:'白金会员', minTrips:15, discount:0.85, color:'#3498db' },
  { level:5, name:'钻石会员', minTrips:30, discount:0.80, color:'#9b59b6' }
];

var SURNAMES = ['王','李','张','刘','陈','杨','黄','赵','周','吴','徐','孙','马','胡','朱','郭','何','罗','高','林','梁','郑','谢','宋','唐','韩','曹','许','邓','冯','萧','程','蔡','彭','潘','袁','于','董','余','苏','叶','吕','魏','蒋','田','杜','丁','沈','任','姚','卢','姜','崔','钟','谭','陆','汪','范','廖','石','金','贾','夏','薛','雷','贺','倪','汤','龙','段','黎','史','陶','毛','郝','龚','邵','万','钱','严','覃','武','戴','莫','孔','向','汤'];
var GIVEN_NAMES = ['伟','芳','娜','秀英','敏','静','丽','强','磊','军','洋','勇','艳','杰','娟','涛','明','超','秀兰','霞','平','刚','桂英','文','辉','鑫','玉兰','红','玲','飞','华','兰','萍','桂兰','英','梅','鹏','旭','博','雪','松','蕾','琳','宇','峰','浩','志','昊','天','睿','晨','思','雨','欣','怡','佳','悦','子涵','子轩','梓涵','一诺','浩然','宇轩','欣怡','诗涵','可馨','梦瑶','雨桐','紫萱','思颖','若曦','语嫣','佳琪','雨薇','梓萱','诗琪','心怡','雅琴','晓峰','建国','志强','建华','国强','海涛','文博','永强','天翔','子豪','泽宇','浩宇','铭轩','逸飞','嘉诚','俊豪','天佑','文昊','修远'];

function generateMemberId() {
  var prefix = 'VIP';
  var ts = Date.now().toString(36).toUpperCase();
  var rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return prefix + ts.slice(-4) + rand;
}

function generateMemberName() {
  var surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  var given = GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
  if (Math.random() < 0.3) {
    given += GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
  }
  return surname + given;
}

function generatePhone() {
  var prefixes = ['138','139','136','137','135','158','159','188','187','186','177','176','155','153','180','181','182','183','189','170','171','172','173','175','178','198','199','166','167'];
  var p = prefixes[Math.floor(Math.random() * prefixes.length)];
  var n = '';
  for (var i = 0; i < 8; i++) n += Math.floor(Math.random() * 10);
  return p + n;
}

function generateMember() {
  var name = generateMemberName();
  var phone = generatePhone();
  var id = generateMemberId();
  var totalTrips = Math.floor(Math.random() * 35);
  var level = 1;
  for (var i = MEMBER_LEVELS.length - 1; i >= 0; i--) {
    if (totalTrips >= MEMBER_LEVELS[i].minTrips) { level = MEMBER_LEVELS[i].level; break; }
  }
  var totalSpent = Math.round(totalTrips * (200 + Math.random() * 800));
  var registerDay = Math.max(1, gameState.currentDay - Math.floor(Math.random() * 90 + 10));
  return {
    id: id,
    name: name,
    phone: phone,
    level: level,
    totalTrips: totalTrips,
    totalSpent: totalSpent,
    registerDay: registerDay,
    lastRentalDay: totalTrips > 0 ? Math.max(registerDay, gameState.currentDay - Math.floor(Math.random() * 30)) : 0,
    isActive: Math.random() > 0.15
  };
}

function getMemberLevelInfo(level) {
  return MEMBER_LEVELS.find(function(l){ return l.level === level; }) || MEMBER_LEVELS[0];
}

function generateInitialMembers(count) {
  var members = [];
  for (var i = 0; i < count; i++) {
    members.push(generateMember());
  }
  return members;
}

function addNewMember() {
  var member = generateMember();
  member.totalTrips = 0;
  member.totalSpent = 0;
  member.registerDay = gameState.currentDay;
  member.lastRentalDay = 0;
  member.level = 1;
  member.isActive = true;
  gameState.members.push(member);
  return member;
}

function updateMemberAfterRental(memberId, amount) {
  var member = gameState.members.find(function(m){ return m.id === memberId; });
  if (!member) return;
  member.totalTrips++;
  member.totalSpent += amount;
  member.lastRentalDay = gameState.currentDay;
  for (var i = MEMBER_LEVELS.length - 1; i >= 0; i--) {
    if (member.totalTrips >= MEMBER_LEVELS[i].minTrips) {
      if (member.level < MEMBER_LEVELS[i].level) {
        member.level = MEMBER_LEVELS[i].level;
        addMessage('👤 会员 ' + member.name + ' 升级为 ' + MEMBER_LEVELS[i].name + '！', 'good');
      }
      break;
    }
  }
}

function getActiveMemberCount() {
  return gameState.members.filter(function(m){ return m.isActive; }).length;
}

function getMemberLevelDistribution() {
  var dist = {};
  MEMBER_LEVELS.forEach(function(l){ dist[l.level] = 0; });
  gameState.members.forEach(function(m){ dist[m.level] = (dist[m.level] || 0) + 1; });
  return dist;
}
