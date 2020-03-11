//<script language="JavaScript">
function OpenNew(page) {
    ret = this.open(page, "CtrlWindow",
		    "toolbar=1, menubar=1, location=1, scrollbars=1, resize=1,width=500,height=800",);
}

var template_list= {
    'http/https': [
    ]
}

function getInsertType() {
    active = '';
    $('a[data-toggle="tab"]').each(function(i){
	if($(this).parent().attr("class") == 'list-group-item-info active'){
	    active = $(this).attr("href");
	}
    });
    return active;
}

function input2val(newRow,row,tlist,suffix='') {
    tlist.forEach(function(val,index,ar){
        newRow.children('td.c_'+val).text($('[id=t_'+val+suffix+']').val());
    });
}

function makeNewRow(btn,direction,myadmlv=-1) {
    var row = $(btn).closest("tr");
    var acltype = getInsertType();

    var newRow;
    if(acltype == '#ACLdetail') {
	newRow = $('.acl_template:first').clone(true);
    } else if (acltype == '#ACLtemplate') {
	//alert("テンプレートが未実装のため使えません");
	//return false;
	//if($('#t_filtertype_tmp').val() == '----') {
	if($('#t_filtertype_tmp').val() == '----') {
	    alert('テンプレートタイプを選択してください');
	    return false;
	}
	newRow = $('.tmp_template:first').clone(true);
	$(newRow).children('td.c_profile').removeClass().addClass('c_profile');
	additional = [['c_srcnet4',2,],['c_srcport4',4],['c_dstport4',5],['c_protocol',6],['c_direction',7]];
	additional.forEach(function(tag,i) {
            tagopt = '<td class="'+tag[0]+'" style="width: 27px;">---</td>';
            $(tagopt).insertAfter(newRow[0].children[tag[1]]);
	});
    } else {
	alert('Unknown error.');
	return false;
    }
    tags = [['c_delete_this',0],,['c_move_below',0],['c_move_above',0],['c_add_below',0],['c_add_above',0],
	    ['c_admlv',6],['c_order',7],['c_status',8]];
    tags.forEach(function(tag,i) {
	tagopt = '<td class="'+tag[0]+'"></td>';
        $(tagopt).insertBefore(newRow[0].children[tag[1]]);
    });
    var myid = $('input[id="myid"]').val(); 
    $('<td class="c_owner">'+myid+'</td>').insertAfter(newRow[0].lastChild);

    if(myadmlv < 0) {
	newRow.children('td.c_admlv').text(row.children('td.c_admlv').text());
    } else {
	newRow.children('td.c_admlv').text(myadmlv);
    }
    newRow.children('td.c_status').text('追加待');
    newRow.children('td.c_status').css('color','#55cc88');
    newRow.children('td.c_target').removeAttr('id');
    newRow.removeAttr('id');
    
    if (acltype == '#ACLdetail') {
	//input2val(newRow,row,['srcnet4','dstnet4','srcport4','dstport4','placement','protocol','direction','filtertype']);
	input2val(newRow,row,['srcnet4','dstnet4','srcport4','dstport4','protocol','direction',]);
	newRow.children('td.c_profile').text($('#t_profile option:selected').text());
	newRow.children('td.c_placement').text($('#t_placement option:selected').text());
	//console.log($('#t_profile option:selected').text());
	//newRow.children('td.c_filtertype').text($('#t_filtertype option:selected').text());
	newRow.children('td.c_filtertype').text($('#t_filtertype option:selected').text());
    } else if (acltype == '#ACLtemplate') {
	input2val(newRow,row,['dstnet4',],'_tmp');
	newRow.children('td.c_profile').text($('#t_profile_tmp option:selected').text());
	//newRow.children('td.c_filtertype_tmp').text($('#t_filtertype_tmp option:selected').text());
	newRow.children('td.c_placement').text($('#t_placement_tmp option:selected').text());	
	newRow.children('td.c_filtertype').text($('#t_filtertype_tmp option:selected').text());
    }
    
    setButtons(newRow);

    if(myadmlv < 0) {
	if(direction=='above') {
            newRow.insertBefore(row);
	} else if (direction == 'below') {
            newRow.insertAfter(row);
	}
    } else {
	newRow.insertAfter(row);
	row.remove();
    }
}

function ip2int(ipaddr) {
    a = ipaddr.split('/');
    if(a.length != 2) return ["アドレス形式が違います。ホストについては/32で指定してください。",""];
    if(+a[1] > 32 || +a[1] < 0) return ["ネットマスクの値が不正です。",""];
    b = a[0].split('.');
    if(b.length != 4) return ["IPアドレスとして解釈できません。",""];
    
    digit_ok = true;
    $.each(b, function(index,val) {
  	if(isNaN(val) || +val > 255 || +val < 0) {
  	    digit_ok = false;
  	}
    });
    if(!digit_ok) return ["IPアドレスとして解釈できません。",""];
    
    i0 = 256*(256*(256*(+b[0])+(+b[1]))+(+b[2])) + (+b[3]);
    i1 = i0 + 2**(32-(+a[1])) -1;
    
    return [i0,i1];
}

function ipng() {
    var ret = 'ok';
    var ips = [];
    $.each(['t_srcnet4','t_dstnet4'],function(index,ipaddr) {
  	adr = $.trim($('[id='+ipaddr+']'));
  	ipn =ip2int($.trim($('[id='+ipaddr+']').val()));
  	if(ret=='ok' && isNaN(ipn[0])) ret = ipn[0];
  	ips.push(ipn)
    });
    cnet = ip2int($.trim($('[id=current_subnet]').text()));
    
    srcip_ok = ips[0][0]>=cnet[0] && ips[0][1] <= cnet[1];
    dstip_ok = ips[1][0]>=cnet[0] && ips[1][1] <= cnet[1];
    
    if(ret == 'ok' && !srcip_ok && !dstip_ok) ret = "設定するACLは、src、またはdstのネットワークが管理範囲内である必要があります。";
    
    return ret;
}

function checkSanity(btn,direction) {
    var row = $(btn).closest("tr");
    //var newRow = $('.acl_template:first');
    var activeTab = $("#aclinsert .tab-pane.active");
    var seq = ['','',''];

    if( activeTab.hasClass('ACLtemplate')) {
	seq[1] = $.trim($('[id=t_placement_tmp]').val());
    } else {
	seq[1] = $.trim($('[id=t_placement]').val());
    };

    if(direction == 'above') {
  	seq[2] = $.trim($(row).prev().children('td.c_placement').text());
  	seq[0] = $.trim($(row).children('td.c_placement').text());
    } else if( direction == 'below') {
  	seq[2] = $.trim($(row).children('td.c_placement').text());
  	seq[0] = $.trim($(row).next().children('td.c_placement').text());
    } else if ( direction == 'first') {
  	//seq[2] = $.trim($(row).prev().children('td.c_placement').text());
  	//seq[0] = $.trim($(row).next().children('td.c_placement').text());
  	seq[2] = $.trim($(row).prev().children('td.c_placement').text());
  	seq[0] = $.trim($(row).children('td.c_placement').text());
    }
    var oseq = seq.slice().sort();
    sanity = oseq.join('') == seq.join('');
    
    return sanity;
}

function addButton(cond,row,colClass,btnID,btType,btSize,btText) {
    if(cond) {
  	$(row).children(colClass).html('<button id="'+btnID+'" type="button" class="btn '+btType+' '+btSize+'">'+btText+'</button>');
    } else {
  	$(row).children(colClass).html('');
    }
    return cond;
}

var semaphore = 0;

function setHooks(myadmlv) {
    //$('#delete_this').click(function() {
    $('table').delegate('#delete_this','click', function() {
  	$(this).attr("disabled",true);
  	if(semaphore == 1) return false;
  	semaphore = 1;
	
  	var row = $(this).closest("tr");
  	var status = row.children("td.c_status");
	
  	if ( $.trim(status.text()) == '適用中' ) {
            status.text('削除待');
            status.css('color','#ff9999');
  	    addButton(true,row,'td.c_delete_this','delete_this','btn-info','btn-xs','取消');
  	} else if($.trim(status.text()) == "削除待") {
            status.text('適用中');
            status.css('color','#000000');
            addButton(true,row,'td.c_delete_this','delete_this','btn-danger','btn-xs','削除');
  	} else if($.trim(status.text()) == "追加待") {
            status.text('取下待');
            status.css('color','#556600');
            addButton(true,row,'td.c_delete_this','delete_this','btn-success','btn-xs','戻す');
  	} else if($.trim(status.text()) == "取下待") {
            status.text('追加待');
            status.css('color','#55cc88');
            addButton(true,row,'td.c_delete_this','delete_this','btn-danger','btn-xs','戻す');
  	}
  	renum();
  	setButtons2Table('#curtbl');
	
  	$(this).attr("disabled",false);
  	semaphore = 0;
  	//var $newRow = $('.acl_template').clone(true);
    });
    
    $('table').delegate('#first_line','click', function(){
  	ip_ng = ipng();
  	if(ip_ng != 'ok') {
  	    window.alert(ip_ng);
  	    return false;
  	}
	
	var row = $(this).closest("tr");
	
	if($.trim($(row).children('td.c_placement').text()) != $('#t_placement').val()
           && $.trim($(row).children('td.c_first_line').text()) != 'ACL作成' ) {
	    window.alert('その位置には挿入できません.top/bottomを切り替えてください.');
   	    //window.alert('その位置には挿入できません。'+$.trim($(row).children('td.c_placement').text())+'に切り替えてください.');
  	    return false;
  	}
	
  	sanity = checkSanity(this,'first');
  	if(!sanity) {
  	    var sanepos = $.trim($(this).closest('tr').children('td_placement').text) === 'top' ? 'bottom' : 'top';
  	    window.alert('その位置には挿入できません.top/bottomを切り替えてください.');
  	    //window.alert('その位置には挿入できません.'+sanepos+'に切り替えてください.');
  	    return false;
  	}
	//makeFirstRow(this,'above',myadmlv);
	makeNewRow(this,'above',myadmlv);
  	renum();
  	setButtons2Table('#curtbl');
    });
    
    //$('#add_above').click(function() {
    $('table').delegate('#add_above','click', function(){
  	ip_ng = ipng();
  	if(ip_ng != 'ok') {
  	    window.alert(ip_ng);
  	    return false;
  	}
	
  	sanity = checkSanity(this,'above');
  	if(!sanity) {
  	    //window.alert('その位置には挿入できません.top/bottomを切り替えてください.');
  	    var sanepos = $.trim($(this).closest('tr').children('td_placement').text) === 'top' ? 'bottom' : 'top';
  	    window.alert('その位置には挿入できません.top/bottomを切り替えてください.');
  	    //window.alert('その位置には挿入できません.'+sanepos+'に切り替えてください.');
  	    return false;
  	}
  	makeNewRow(this,'above');
  	renum();
  	setButtons2Table('#curtbl');
    });
    //$('#add_below').click(function() {
    $('table').delegate('#add_below','click', function(){
  	ip_ng = ipng();
  	if(ip_ng != 'ok') {
  	    window.alert(ip_ng);
  	    return false;
  	}
	
  	sanity = checkSanity(this,'below');
  	if(!sanity) {
  	    var sanepos = $.trim($(this).closest('tr').children('td_placement').text) === 'top' ? 'bottom' : 'top';
  	    window.alert('その位置には挿入できません.top/bottomを切り替えてください.');
  	    //window.alert('その位置には挿入できません.'+sanepos+'に切り替えてください.');
  	    return false;
  	}
	
  	makeNewRow(this,'below');
  	renum();
  	setButtons2Table('#curtbl');
    });
    
    $('table').delegate('#move_above','click', function(){
  	var row = $(this).closest("tr");
  	var prow = row.prev();
  	var crow = row.clone(true);
  	crow.insertBefore(prow);
  	row.remove();
  	renum();
  	setButtons2Table('#curtbl');
    });
    $('table').delegate('#move_below','click', function(){
  	var row = $(this).closest("tr");
  	var nrow = row.next();
  	var crow = row.clone(true);
  	crow.insertAfter(nrow);
  	row.remove();
  	renum();
  	setButtons2Table('#curtbl');
    });
    $('#submit_table').on('click',function(){
  	$(this).attr("disabled",true);
  	AjaxSend(true);
  	$(this).attr("disabled", false);
    });
}

function boolArg(is_ok) {
    console.log(is_ok);
}

function setButtons(row) {
    //var myadmlv = $('td[id="myadmlv"]').text(); //$('#myadmlv').text();
    var myadmlv = $('input[id="myadmlv"]').val(); //$('#myadmlv').text();
    
    var pplc = $(row).prev().children('td.c_placement').text();
    var plc = $(row).children('td.c_placement').text();
    var nplc = $(row).next().children('td.c_placement').text();
    var plv = $(row).prev().children('td.c_admlv').text() - 0;
    var lv = $(row).children('td.c_admlv').text() - 0;
    var nlv = $(row).next().children('td.c_admlv').text() - 0;
    var order = $(row).children('td.c_order').text() - 0;
    var status = $.trim($(row).children('td.c_status').text());
    
    
    addButton(myadmlv <= lv,row,'td.c_add_above','add_above','btn-primary','btn-xs','↑');
    addButton(myadmlv <= lv,row,'td.c_add_below','add_below','btn-primary','btn-xs','↓');
    
    addButton(myadmlv <= lv && pplc == plc && plv == lv ,row,
  	      'td.c_move_above','move_above','btn-success','btn-xs','↑');
    addButton(myadmlv <= lv && nplc == plc && nlv == lv,row,
  	      'td.c_move_below','move_below','btn-success','btn-xs','↓');
    
    if(!addButton(myadmlv <= lv && status == '適用中',row,'td.c_delete_this','delete_this','btn-danger','btn-xs','削除')) {
  	if(!addButton((myadmlv <= lv && status == '削除待') || (myadmlv <= lv && status == '追加待'),row,'td.c_delete_this','delete_this','btn-info','btn-xs','取消')) {
  	    addButton(myadmlv <= lv && status == '取下待',row,'td.c_delete_this','delete_this','btn-success','btn-xs','戻す');
  	}
    }
}

function setButtons2Table(tbl) {
    //    $('#curtbl tr').each(function(){
    $(tbl+' tr').each(function(){
  	setButtons(this);
    });
}

function renum() {
    var prevlv = 0;
    var prevplc = '';
    var seq = 0;
    var ds = 1;
    $('#curtbl tr').each(function() {
  	var plc = $(this).children('td.c_placement').text();
  	var lv = $(this).children('td.c_admlv').text();

  	if( lv != prevlv || plc != prevplc )  seq = 0;
  	seq += 1;
  	$(this).children('td.c_order').text(seq);
  	prevlv = lv;
  	prevplc = plc;
    });
    
}

function AjaxSend(mes) {
    var data = toJSON();
    var aclurl = $('input[id="getlist"]').val();
    //debugger;
    $.ajax({
  	type:"post",
  	//url:"{% url 'utac:getlist' %}",
	url: aclurl,
  	data:JSON.stringify(data),
  	contentType: 'application/json',
  	dataType: "json",
  	success: function(json_data) {   // 200 OK時
	    // JSON Arrayの先頭が成功フラグ、失敗の場合2番目がエラーメッセージ
  	    if (!json_data[0]) {    // サーバが失敗を返した場合
  		alert("Transaction error. " + json_data[1]);
  		return;
  	    }
  	    if(mes) {alert(json_data[1]);}

  	},
  	error: function() {         // HTTPエラー時
  	    alert("Server Error. Pleasy try again later.");
  	},
  	complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
  	    semaphore = 0;
	    location.reload(); 		// 成功時処理
  	}
    });
}

function templateConv(val) {
    
}

function toJSON() {
    var foreign_dict = {
  	'placement': { 'top': 1, 'bottom': 2 },
  	'status' : { '追加待' : 2, '適用中' : 3, '削除待': 4 , '取下待': 99},
	'protocol' : { '---': -1,
		       'TCP': 1, 'UDP': 2, 'ICMP': 3, 'ALL': 4 ,
		     },
  	'direction' : { 'incoming': 1, 'outgoing': 2, 'both': 3 , '---': 3 },
  	'filtertype' : { 'allow': 1, 'deny': 2 ,
			 'Web Server' : 101 , 'SSH Server' : 102, 'CONFERENCE': 103, 'PROTECTED EQUIV' : 104
		       },
	'profile': { 'none': 0, 'BASIC': 1 },
    }
    
    var data = [];
    var terms = ['order','target','admlv','pk',
  		 'srcnet4','dstnet4','srcport4','dstport4',
  		];
    
    $('#curtbl tr').each(function(index,val) {
  	// Skip header and placeholder rows
  	if (index == 0 || $.trim($(val).children('td.c_target0').text()).lastIndexOf('No managed',0) === 0) return true;
	
  	row = $(val);
  	rowdata = {};

	// Terms to be converted into froms in ACL table 
  	$.each(terms,function(index,term) {
  	    rowdata[term] = $.trim(row.children('td.c_'+term).text());

  	    if(!isNaN(rowdata[term])) rowdata[term] = +rowdata[term];
	    if(rowdata[term] == '---') {
		if(term=='srcnet4' || term=='srcnet4') rowdata[term] = '0.0.0.0/0'
		else rowdata[term] = -1
	    }

  	});

  	$.each(foreign_dict, function(fterm,fdict) {
  	    rowdata[fterm+'_id'] = fdict[$.trim(row.children('td.c_'+fterm).text())];
  	});
	
  	rowdata['owner'] = $.trim(row.children('td.c_owner').text());
	
  	a = +rowdata['admlv'];
  	p = 1;
  	if(rowdata['placement'] == 'bottom') p = 2;
  	rowdata['sorting'] = a + (p-1)*(7-2*a);
	
  	if(rowdata['owner'] != '') data.push(rowdata);
  	//'placement' : row.children(td.c_placement).text();
	
    });
    //console.log(rowdata);
    
    //console.log(JSON.stringify(data));
    return data;
}

function checkNoACL(myadmlv) {
    // 外部ファイル化に伴い、jinja2参照不可  
    // var myadmlv = {{ myadmlv }}; 
    var aclrows = $('table[id=curtbl] tr');

    var has_myadmlv = false;
    
    var has_level = {'top':[false,false,false,false],'bottom':[false,false,false,false]}
    var lvs = [];
    var top_bottom = 0,prevplc='top';
    var lv3upper = 0,lv3lower = 0; // Lv3の上端と下端を調べておく
    
    aclrows.each(function(index,val) {
  	admlv = $(val).children('td.c_admlv').text() - 0;
  	plc = $(val).children('td.c_placement').text();
  	if(plc=='top'||plc=='bottom') has_level[plc][admlv] = true;
  	lvs.push(admlv);
	
	
  	plcthis = $(val).children('td.c_placement').text() - 0;
  	if(admlv==myadmlv) has_myadmlv=true;
  	if(prevplc=='top' && plcthis=='bottom') top_bottom = index;
	
  	if( admlv == 3) {
  	    if(lv3upper == 0) {
  		lv3upper = index;
  	    }
  	    lv3lower = index;
  	}
    });
    has_level['top'].shift();
    has_level['bottom'].shift();
    
    // 全位置・全レベルfalse判定のためにshift()かかってることに注意
    noentry = !(has_level['top'][0] || has_level['top'][1] || has_level['top'][2] || has_level['bottom'][0] || has_level['bottom'][1] || has_level['bottom'][2] );
    if(noentry) return;
    
    var addrow = $('tr[id=no_acl_for_myadmlv]');
    if(myadmlv == 1) {
  	if(!has_level['top'][0] && !has_level['bottom'][0]) {
  	    var addrow2 = $(addrow).clone();
  	    $(addrow2).insertAfter($(aclrows[0]));
  	    var addrow2 = $(addrow).clone();
  	    $(addrow2).insertAfter($(aclrows[aclrows.length-1]));
  	} else if(!has_level['bottom'][0]) {
  	    if(top_bottom>0 || has_level['top'][1] || has_level['top'][2] ) {
  		var addrow2 = $(addrow).clone();
  		$(addrow2).children('td.c_placement').text('bottom');
  		$(addrow2).insertAfter($(aclrows[aclrows.length-1]));
  	    }
  	} else if(!has_level['top'][0]) {
  	    if(top_bottom>0 || has_level['bottom'][1] || has_level['bottom'][2] ) {
  		var addrow2 = $(addrow).clone();
  		$(addrow2).insertAfter($(aclrows[0]));
  	    }
  	}
    } else if( myadmlv == 2 ) {
  	if(!has_level['top'][2] && !has_level['bottom'][2]) { // Lv3がない場合
  	    if((!has_level['top'][1])&&(!has_level['bottom'][1])) { // Lv2がどちらか一方あれば不要
  		if(!has_level['top'][0]) { // Lv1がbottomだけならタイトル行の下
  		    var addrow2 = $(addrow).clone();
  		    $(addrow2).insertAfter($(aclrows[0]));
  		} else { //ここにくるのはLv1のtopのみのとき
  		    var addrow2 = $(addrow).clone();
  		    $(addrow2).insertAfter($(aclrows[aclrows.length-1]));
  		}
  	    }
  	} else { // Lv3がある場合。Lv2が存在しない側に入れる
  	    if(!has_level['top'][1]) {
  		var addrow2 = $(addrow).clone();
  		$(addrow2).insertBefore($(aclrows[lv3upper]));
  	    }
  	    if(!has_level['bottom'][1]) {
  		var addrow2 = $(addrow).clone();
  		$(addrow2).insertAfter($(aclrows[lv3lower]));
  	    }
  	}
    } else if( myadmlv == 3 ) {
  	if(!has_level['top'][2] && !has_level['bottom'][2] ) {
  	    if( top_bottom > 0 ) {  // top/bottomの境界があればそこの前に入れる
  		var addrow2 = $(addrow).clone();
  		$(addrow2).insertBefore($(aclrows[top_bottom]));
  	    } else if ( (!has_level['top'][0] && !has_level['top'][1]) ) {
  		// bottom しかない　ならタイトル行の下に入れる
  		var addrow2 = $(addrow).clone();
  		$(addrow2).insertAfter($(aclrows[0]));
  	    } else { // topしかない場合のみが残るので最後の行の下に入れる
  		var addrow2 = $(addrow).clone();
  		$(addrow2).insertAfter($(aclrows[aclrows.length-1]));
  	    }
  	}
    }
}

function deleteList() {
    $('#deltarget').hide();
    to_delete = $('[name="optarget"]:checked').map(function(){
	return $(this).val();
    }).get();

    if(to_delete.length <= 0) {
	$('#deltarget').append('<tr><td colspan="4">削除するエントリが選択されていません</td></tr>');
	$('#doDelete').hide();
    } else {
	$('#deltarget').append('<tr><td colspan="4">以下のエントリを削除します。よろしいですか?</td></tr>');
	to_delete.forEach(function(val,index,ar){
	    t = $('#'+val).parent().parent()
	    
	    hosttype = t.children('td:eq(1)').text()
	    ip = t.children('td:eq(2)').text()
	    admid = t.children('td:eq(5)').text()
	    admin =t.children('td:eq(6)').text()
	    $('#deltarget').append(
		'<tr><td>'+hosttype+'</td><td>'+ip+'</td><td>'+admid+'</td><td>'+admin+'</td><tr>'
	    )});
	$('#doDelete').show();
	$('#deltarget').show();
    }
}			 
			  
function deleteIpinfo(url) {
    to_delete = $('[name="optarget"]:checked').map(function(){
	return $(this).val();
    }).get();

    data = {'pk': to_delete };

    $.ajax({
  	type:"post",
	url: url,
  	data: JSON.stringify(data),
  	contentType: 'application/json',
  	dataType: "json",
  	success: function(json_data) {   // 200 OK時
	    // JSON Arrayの先頭が成功フラグ、失敗の場合2番目がエラーメッセージ
  	    if (!json_data[0]) {    // サーバが失敗を返した場合
  		alert("Transaction error. " + json_data[1]);
  		return;
  	    }
	    alert(json_data[1]);
  	},
  	error: function() {         // HTTPエラー時
  	    alert("Server Error. Pleasy try again later.");
  	},
  	complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
  	    semaphore = 0;
	    location.reload(); 		// 成功時処理
	    $('#deltarget tr').remove();
  	}
    });

    $('#confirmModal').modal('hide');
}

//</script>
