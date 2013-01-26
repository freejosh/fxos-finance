/*jshint jquery:true, devel:true */
/*global define */
// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

define(function(require) {
    // Receipt verification (https://github.com/mozilla/receiptverifier)
    //require('receiptverifier');

    // Installation button
    //require('./install-button');

    // Install the layouts
    require('layouts/layouts');

    var _ = require('underscore');
    var Backbone = require('backbone');
    require('backbone.localstorage');

    // Write your app here.


    function formatDate(d) {
        if (!(d instanceof Date)) d = new Date(d);

        return (d.getMonth()+1) + '/' +
            d.getDate() + '/' +
            d.getFullYear();
    }

    function formatCurrency(n) {
        if (n < 0) {
            return '($' + Math.abs(n) + ')';
        } else {
            return '$' + n;
        }
    }

    function validateValue(val) {
        val = parseFloat(val);
        if (_.isNumber(val) && !_.isNaN(val)) return val;
        return false;
    }

    // List view

    var list = $('.list').get(0);

    function updateTotal() {
        var total = 0;
        list.collection.each(function(model) {
            total += model.get('value');
        });
        $('h1', list).text(formatCurrency(total));
    }

    list.renderRow = function(model) {
        var $this = $(this);

        $this.empty();

        var val = model.get('value');
        if (val >= 0) {
            $this.addClass('positive');
        } else {
            $this.addClass('negative');
        }

        $this.append($('<div>').addClass('date').append(formatDate(model.get('date'))));
        $this.append($('<div>').addClass('title').append(model.get('title')));
        $this.append($('<div>').addClass('value').append(formatCurrency(val)));
    };

    $('h1', list).text(formatCurrency(0));

    list.collection.localStorage = new Backbone.LocalStorage('list');
    list.collection.fetch({
        success: updateTotal
    });

    $('footer .add', list).click(function() {
        var val = validateValue($('footer input[name=value]', list).val());

        if (val !== false) {
            list.collection.create({
                value: val,
                title: $('footer input[name=title]').val(),
                date: new Date()
            });
            $('footer input', list).val('');

            updateTotal();
            
        } else {
            alert('Not a valid amount');
        }
    });

    list.nextView = '.edit';

    // Edit view

    var edit = $('.edit').get(0);
    edit.render = function(item) {
        item = item || { id: '', get: function() { return ''; } };

        $('input[name=id]', this).val(item.id);
        $('input[name=title]', this).val(item.get('title'));
        $('input[name=desc]', this).val(item.get('desc'));
    };

    edit.getTitle = function() {
        var model = this.view.model;

        if (model) {
            return model.get('title');
        } else {
            return 'New';
        }
    };

    $('button.add', edit).click(function() {
        var el = $(edit);
        var title = el.find('input[name=title]');
        var desc = el.find('input[name=desc]');
        var model = edit.model;

        if(model) {
            model.set({ title: title.val(), desc: desc.val() });
        } else {
            list.add({ title: title.val(),
                       desc: desc.val(),
                       date: new Date() });
        }

        edit.close();
    });
});