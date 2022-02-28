import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { UpdateUserDto } from './../src/user/dto';
import { BookmarkDto } from 'src/bookmark/dto/bookmark.dto';
import { EditBookmarkDto } from 'src/bookmark/dto/edit-bookmark.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.dbClean();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    // the connect to db is also close
    app.close();
  });
  describe('Auth', () => {
    const Dto: AuthDto = {
      email: 'sarakkornsako@gmail.com',
      password: '12345678',
    };
    describe('Signup', () => {
      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(Dto)
          .expectStatus(HttpStatus.CREATED)
          .inspect();
      });

      it('should throw error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(Dto.password)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(Dto.email)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw error if body is not provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
    });

    describe('SignIn', () => {
      it('should throw error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(Dto.password)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(Dto.email)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw error if body is not provided', () => {
        pactum.spec().post('/auth/signin').expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(Dto)
          .expectStatus(HttpStatus.OK)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get my profile', () => {
        pactum
          .spec()
          .get('/users/me')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .expectStatus(HttpStatus.OK);
      });
    });
    describe('Update user', () => {
      const dto: UpdateUserDto = {
        firstName: 'haise',
        email: 'haise@sasaki.com',
      };
      it('should update user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders('Authorization', 'Bearer $S{userAt}')
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmark', () => {
    const dto: BookmarkDto = {
      title: 'you dont know JS',
      description: 'because it has just new features',
      link: 'www.js.com',
    };
    describe('GET empty bookmark', () => {
      it('should return bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .expectBody([])
          .expectStatus(HttpStatus.OK);
      });
    });
    describe('Create bookmark', () => {
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders('Authorization', 'Bearer $S{userAt}')
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED)
          .stores('bookmarkId', 'id');
      });
    });

    describe('GET all bookmarks', () => {
      it('should return bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1);
      });
    });

    describe('GET bookmark by id', () => {
      it('should return bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(HttpStatus.OK)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('UPDATE bookmark', () => {
      it('should update boomark', () => {
        const newDto: EditBookmarkDto = {
          description: '',
        };
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withBody(newDto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link);
      });
    });
    describe('Delete bookmark', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(HttpStatus.NO_CONTENT);
      });
      it('should return empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(0)
          .inspect();
      });
    });
  });
});
