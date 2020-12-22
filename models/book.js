'use strict';
const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = (sequelize) =>{
    class Book extends Sequelize.Model {
        // publishedAt(){
        //     const date = moment(this.createdAt).format('MMMM D, YYYY, h:mma');
        //     return date;
        // }
        // shortDescription(){
        //     const shortDesc = this.body.length > 200? this.body.substring(0,200) + '...' : this.body;
        //     return shortDesc;
        // }
    }
    Book.init({
        title: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: '"Title" is required'
                }
            }
        },
        author: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: '"Author" is required'
                }
            }
        },
        genre: Sequelize.STRING,
        year: {
            type: Sequelize.INTEGER,
            validate: {
                notEmpty: {
                    msg: '"Year" is required'
                },
                isNumeric: {
                    msg: '"Year" should be a number'
                }
            }
        }
    }, {sequelize});

    return Book;

}