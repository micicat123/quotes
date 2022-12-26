import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Put, Req, Res, UseGuards} from '@nestjs/common';
import { Response, Request } from 'express';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
const bcrypt = require('bcryptjs');

@Controller('auth')
export class AuthController {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly authService: AuthService
    ){}

    @Post('login')
    async login(
        @Body('email') email: string,
        @Body('password') password: string,
        @Res({passthrough: true}) response : Response
    ){
        const found = await this.userService.findBy({email});
        if (!found) throw new NotFoundException("User not found");
        if (!await bcrypt.compare(password, (await found).password)) throw new BadRequestException("Invalid credentials.");

        const jwt = await this.jwtService.sign({user_id: (await found).user_id}, {expiresIn: '5d', secret:'123'});

        response.cookie('jwt', jwt, {httpOnly: true});

        return jwt;
    }

    @UseGuards(AuthGuard)
    @Post('logout')
    async logout(@Res({passthrough: true}) response : Response){
        response.clearCookie('jwt');
        return console.log("logged out");
    }
}