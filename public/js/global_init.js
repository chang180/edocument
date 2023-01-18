var Basic = {
    _webBaseEncode: function _webBaseEncode(e) {
        var t, r = "";
        t = encodeURIComponent(e);
        for (var a = 0; a < t.length; a++) r += t.charCodeAt(a).toString(16);
        return r
    },
    getFormJsonData: function getFormJsonData($form) {
        var unindexed_array = $form.serializeArray();
        var indexed_array = {};
        $.map(unindexed_array, function(n, i) {
            indexed_array[n['name']] = n['value'];
        });
        return indexed_array;
    },
 
    add_person: function add_person(Name) {
        $(this).removeData("modal");
        save_method = 'add';
        $('#form')[0].reset(); // reset form on modals
        $('.form-group').removeClass('has-error'); // clear error class
        $('.help-block').empty(); // clear error string
        $('#modal_form').modal('show'); // show bootstrap modal
        TableName = Name;
    },


    add_competence: function add_competence() {
        $(this).removeData("modal");
        save_method = 'add';
        //$('#form')[0].reset(); // reset form on modals
        $('.form-group').removeClass('has-error'); // clear error class
        $('.help-block').empty(); // clear error string
        $('#modal_competence').modal('show'); // show bootstrap modal
    },


    add_mail: function add_mail() {
        $(this).removeData("modal");
        save_method = 'add';
        //$('#form')[0].reset(); // reset form on modals
        $('.form-group').removeClass('has-error'); // clear error class
        $('.help-block').empty(); // clear error string
        $('#modal_mail').modal('show'); // show bootstrap modal
    },


    add_updating: function add_updating() {
        $(this).removeData("modal");
        save_method = 'add';
        //$('#form')[0].reset(); // reset form on modals
        $('.form-group').removeClass('has-error'); // clear error class
        $('.help-block').empty(); // clear error string
        $('#modal_updating').modal('show'); // show bootstrap modal
    },

    getUrlVars: function getUrlVars() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }   
  
   


};