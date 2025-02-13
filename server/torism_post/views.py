import json
from decimal import Decimal
import re

from django.shortcuts import get_object_or_404
from openai import OpenAI

from .models import MonthlyReport

client = OpenAI(api_key='')
from django.db.models import Q
from django.db import connection
from django.http import HttpResponse
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate, login

from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated

from .serializer import *
from utils import ApiResponse, ExceptionHandler


################################################# Admin #################################################




################################################# Posts #################################################

@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter('product_id', openapi.IN_PATH, type=openapi.TYPE_INTEGER, required=True)
    ],
    responses={
        200: PostSerializer,
        404: "Product not found"
    },
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@ExceptionHandler.handle
def get_post_by_id(request, product_id):
    cur_user = request.user
    cur_product = Product.objects.filter(productId=product_id).first()
    if not cur_product:
        return ApiResponse.error("Product not found")
    serializer = PostSerializer(cur_product, context={'user': cur_user})
    return ApiResponse.success(serializer.data)



################################################# StarredPost ###########################################
