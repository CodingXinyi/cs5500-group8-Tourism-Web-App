from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, AbstractUser
from django.db import models


class User(AbstractUser):
    userId = models.AutoField(primary_key=True)
    isAdmin = models.BooleanField(default=False)

    # for django auth
    last_login = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'User'
        indexes = [
            models.Index(fields=['isAdmin']),
        ]


class Post(models.Model):
    postId = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    userId = models.ForeignKey(User, related_name='posts', on_delete=models.SET_NULL, null=True)
    images = models.TextField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Product'
        indexes = [
            models.Index(fields=['userId']),
        ]


class StarredPost(models.Model):
    userId = models.ForeignKey(User, related_name='starred_posts', on_delete=models.CASCADE)
    posttId = models.ForeignKey(Post, related_name='starred_by_users', on_delete=models.CASCADE)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'StarredProduct'
        unique_together = ('userId', 'postId')


