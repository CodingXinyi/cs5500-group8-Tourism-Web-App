from django.db.models import Avg
from rest_framework import serializers

from .models import User
from django.contrib.auth.hashers import make_password


class UserSerializer(serializers.ModelSerializer):
    isStarred = serializers.SerializerMethodField()
    averageRating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['userId', 'isAdmin']


class PostSerializer(serializers.ModelSerializer):
    pass


class DateRangeSerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()
