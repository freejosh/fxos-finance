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

    // for some reason list.nextView doesn't work
    // list.nextView = '.edit';

    // Edit view

    var edit = $('.detail').get(0);
    edit.render = function(item) {
        $('h1', this).text(formatDate(item.get('date')));
        $('input[name=title]', this).val(item.get('title'));
        $('input[name=value]', this).val(item.get('value'));
    };

    $('button.save', edit).click(function() {
        var $edit = $(edit);

        var val = validateValue($edit.find('input[name=value]').val());

        if (val !== false) {
            edit.model.save({
                title: $edit.find('input[name=title]').val(),
                value: val
            });

            edit.close();
        } else {
            alert('Not a valid amount');
        }
    });
});