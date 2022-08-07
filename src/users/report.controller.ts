import { Router, Request, Response, NextFunction } from "express"
import userModel from "../model/user.model"
import Controller from '../interfaces/controller.interface'

class ReportController implements Controller {
    public path = '/report'
    public router = Router()
    private user = userModel

    constructor() {
        this.initialzeRoutes()
    }

    private initialzeRoutes() {
        this.router.get(`${this.path}`, this.genReport)
    }

    private genReport = async (request: Request, response: Response, next: NextFunction) => {
        const userByCountry = await this.user.aggregate([
            {
                $match: {
                    'address.country': {
                        $exists: true
                    }
                }
            },
            {
                $group: {
                    _id: {
                        country: '$address.country'
                    },
                    users: {
                        $push: {
                            name: '$name',
                            _id: '$_id'
                        }
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'users._id',
                    foreignField: 'author',
                    as: 'articles'

                }
            },
            {
                $addFields: {
                    amountOfArticles: {
                        $size: '$articles'
                    }
                }
            },
            {
                $sort: {
                    amountOfArticles: 1
                }
            }
        ])

        const numberOfUserWithAddress = await this.user.countDocuments({ address: { $exists: true } })
        const countries = await this.user.distinct('address.country', {
            email: {
                $regex: /@gmail.com$/
            }
        });
        response.send({ userByCountry ,numberOfUserWithAddress, countries})
    }
}

export default ReportController